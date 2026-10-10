/**
 * Uploads the images / video bundled in `public/` through the media pipeline (section 5 of the spec),
 * creates their media_assets rows and links them to the seeded content.
 *
 *   npm run media:import            # import + link (idempotent, uses supabase/media-manifest.json)
 *   npm run media:import -- --prune # also delete the imported files from public/
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
 */
import { existsSync } from 'node:fs'
import { readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
  LEGACY_BUSINESS_LINE_COVERS,
  LEGACY_CONTACT_IMAGE,
  LEGACY_EVENT_COVERS,
  LEGACY_EVENT_GALLERY,
  LEGACY_HERO_VIDEO,
  LEGACY_PRODUCTS,
  LEGACY_SECTOR_COVERS,
  LEGACY_TEAM_FILES,
} from '@/lib/content/legacy-media'
import { originalLocation, type MediaKind } from '@/lib/media'
import { processMediaAsset } from '@/lib/media/pipeline'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

const ROOT = process.cwd()
const PUBLIC_DIR = path.join(ROOT, 'public')
const MANIFEST = path.join(ROOT, 'supabase', 'media-manifest.json')
const prune = process.argv.includes('--prune')

const admin = createSupabaseAdminClient()
let manifest: Record<string, string> = {}
const imported = new Set<string>()

const MIME: Record<string, string> = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.mp4': 'video/mp4', '.svg': 'image/svg+xml' }

type ImportOptions = { kind: MediaKind; country: string | null; alt: string; downloadable?: boolean; projectId?: string }

async function importFile(file: string, opts: ImportOptions): Promise<string> {
  const known = manifest[file]
  if (known) {
    const { data } = await admin.from('media_assets').select('id, processing_status').eq('id', known).maybeSingle()
    if (data?.processing_status === 'ready') {
      imported.add(file)
      return known
    }
  }

  const absolute = path.join(PUBLIC_DIR, file)
  const body = await readFile(absolute)
  const mimeType = MIME[path.extname(file).toLowerCase()]
  if (!mimeType) throw new Error(`Unsupported file type: ${file}`)

  const mediaId = known ?? crypto.randomUUID()
  const { bucket, path: objectPath } = originalLocation({ mediaId, kind: opts.kind, countryCode: opts.country, mimeType, projectId: opts.projectId })

  const { error: rowError } = await admin.from('media_assets').upsert({
    id: mediaId,
    country_code: opts.country,
    kind: opts.kind,
    original_bucket: bucket,
    original_path: objectPath,
    mime_type: mimeType,
    bytes: body.byteLength,
    alt_es: opts.alt,
    is_downloadable: opts.downloadable ?? false,
    processing_status: 'pending',
    created_by: null,
  })
  if (rowError) throw rowError

  const { error: uploadError } = await admin.storage.from(bucket).upload(objectPath, body, { contentType: mimeType, upsert: true })
  if (uploadError) throw uploadError

  const result = await processMediaAsset(mediaId)
  if (!result.ok) throw new Error(`Processing failed for ${file}: ${result.error}`)

  manifest[file] = mediaId
  imported.add(file)
  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`)
  console.log(`  ✓ ${file} → ${mediaId}`)
  return mediaId
}

async function check<T extends { error: unknown }>(promise: PromiseLike<T>): Promise<T> {
  const result = await promise
  if (result.error) throw result.error
  return result
}

async function main() {
  manifest = existsSync(MANIFEST) ? JSON.parse(await readFile(MANIFEST, 'utf8')) : {}

  // --- Products (global) — imported first so event galleries reuse the same assets. ---
  console.log('Products')
  for (const n of [1, 2, 3, 4]) {
    await importFile(`images/productos/producto-${n}.webp`, { kind: 'product_photo', country: null, alt: `Producto ${n}` })
  }
  const { data: products } = await check(admin.from('products').select('id, slug, cover_media_id'))
  for (const product of products ?? []) {
    const legacy = LEGACY_PRODUCTS.find(p => p.slug === product.slug)
    if (!legacy || product.cover_media_id) continue
    const mediaId = await importFile(legacy.image, { kind: 'product_photo', country: null, alt: legacy.name })
    await check(admin.from('products').update({ cover_media_id: mediaId }).eq('id', product.id))
    await check(admin.from('product_media').upsert({ product_id: product.id, media_id: mediaId, sort: 0 }, { ignoreDuplicates: true }))
  }

  // --- Brand logos (global) ---
  console.log('Brands')
  const { data: brands } = await check(admin.from('brands').select('id, slug, name'))
  for (const brand of brands ?? []) {
    const file = `images/marcas/marca-${brand.slug}.png`
    if (!existsSync(path.join(PUBLIC_DIR, file)) && !manifest[file]) continue
    const mediaId = await importFile(file, { kind: 'brand_logo', country: null, alt: brand.name })
    await check(admin.from('brands').update({ logo_media_id: mediaId }).eq('id', brand.id))
  }

  // --- Team (MX) ---
  console.log('Team')
  const { data: team } = await check(admin.from('team_members').select('id, full_name, country_code'))
  for (const member of team ?? []) {
    const name = LEGACY_TEAM_FILES[member.full_name]
    if (!name) continue
    const mediaId = await importFile(`images/equipo/${name}.png`, { kind: 'team_photo', country: member.country_code, alt: member.full_name })
    await check(admin.from('team_members').update({ photo_media_id: mediaId }).eq('id', member.id))
  }

  // --- Projects (MX): originals kept privately for high-res downloads ---
  console.log('Projects')
  const { data: projects } = await check(admin.from('projects').select('id, slug, title_es, country_code'))
  for (const project of projects ?? []) {
    const file = `images/proyectos/proyecto-${project.slug}.webp`
    if (!existsSync(path.join(PUBLIC_DIR, file)) && !manifest[file]) continue
    const mediaId = await importFile(file, {
      kind: 'project_photo',
      country: project.country_code,
      alt: project.title_es,
      downloadable: true,
      projectId: project.id,
    })
    await check(admin.from('projects').update({ cover_media_id: mediaId }).eq('id', project.id))
    await check(admin.from('project_media').upsert({ project_id: project.id, media_id: mediaId, sort: 0 }, { ignoreDuplicates: true }))
  }

  // --- Events (MX): covers and post-event galleries ---
  console.log('Events')
  const { data: events } = await check(admin.from('events').select('id, slug, title_es, country_code, starts_at'))
  for (const event of events ?? []) {
    const cover = LEGACY_EVENT_COVERS[event.slug]
    if (cover) {
      const mediaId = await importFile(`images/eventos/${cover}.webp`, { kind: 'event_photo', country: event.country_code, alt: event.title_es })
      await check(admin.from('events').update({ cover_media_id: mediaId }).eq('id', event.id))
    }
    if (new Date(event.starts_at) < new Date()) {
      let sort = 0
      for (const file of LEGACY_EVENT_GALLERY) {
        const mediaId = await importFile(file, { kind: 'event_photo', country: event.country_code, alt: event.title_es })
        await check(admin.from('event_media').upsert({ event_id: event.id, media_id: mediaId, sort: sort++ }, { ignoreDuplicates: true }))
      }
    }
  }

  // --- Areas (business lines) and spaces (sectors) covers ---
  console.log('Taxonomies')
  for (const [slug, name] of Object.entries(LEGACY_BUSINESS_LINE_COVERS)) {
    const mediaId = await importFile(`images/areas/${name}.webp`, { kind: 'generic', country: null, alt: slug })
    await check(admin.from('business_lines').update({ cover_media_id: mediaId }).eq('slug', slug))
  }
  for (const [slug, name] of Object.entries(LEGACY_SECTOR_COVERS)) {
    const mediaId = await importFile(`images/areas/${name}.webp`, { kind: 'generic', country: null, alt: slug })
    await check(admin.from('sectors').update({ cover_media_id: mediaId }).eq('slug', slug))
  }

  // --- Home: contact image and hero video (shared by every country until each uploads its own) ---
  console.log('Home')
  const contactId = await importFile(LEGACY_CONTACT_IMAGE, { kind: 'generic', country: 'mx', alt: 'Contacto IHO' })
  const heroId = await importFile(LEGACY_HERO_VIDEO, { kind: 'hero', country: 'mx', alt: 'IHO' })
  await check(
    admin.from('country_settings').update({ contact_image_media_id: contactId, hero_video_media_id: heroId }).not('country_code', 'is', null),
  )

  console.log(`\nImported ${imported.size} files. Manifest: ${path.relative(ROOT, MANIFEST)}`)

  if (prune) {
    for (const file of imported) await rm(path.join(PUBLIC_DIR, file), { force: true })
    console.log(`Pruned ${imported.size} files from public/.`)
  }
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
