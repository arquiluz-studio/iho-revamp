import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { emptyValues, singletonId, type ResourceConfig, type ResourceKey } from '@/lib/admin/resources'
import { parseSolutionPage, solutionPageMediaIds } from '@/lib/content/solution-page'
import { contentPage } from '@/lib/content/static-pages'
import { listRecords, loadMedia, loadOptions, loadRecord, mediaIdsOf } from '@/lib/admin/data'
import { toFormValues } from '@/lib/admin/form-schema'
import { ADMIN_MEDIA_SELECT, toAdminMedia } from '@/lib/admin/media'
import { previewUrl, publicUrl } from '@/lib/admin/public-url'
import { hasRole, requireAdminSession, type AdminSession } from '@/lib/admin/session'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { AgendaEditor } from './AgendaEditor'
import { ProductExtras } from './catalog/CatalogExtras'
import { formatDateTime } from '@/lib/admin/format'
import { isPastDate } from '@/lib/dates'
import { DataTable } from './DataTable'
import { EventsCalendar, type CalendarParams } from './EventsCalendar'
import { GalleryEditor, type GalleryItem } from './GalleryEditor'
import { ProjectsOrderPage } from './ProjectsOrderPage'
import { PreviousEditionsEditor, type PreviousEditionOption } from './PreviousEditionsEditor'
import { ResourceForm } from './ResourceForm'
import { SolutionPageEditor } from './SolutionPageEditor'
import { SolutionFitEditor, type SolutionSpaceRow } from './SolutionSpacesEditor'
import { ButtonLink, Notice, PageHeader, cn } from './ui'

type AnyRow = Record<string, unknown>

function access(session: AdminSession, config: ResourceConfig) {
  if (config.scope === 'country') {
    const country = session.activeCountry
    return {
      countryCode: country?.code ?? null,
      canRead: Boolean(country) && (!config.singleton || hasRole(session, country!.code, config.writeRole ?? 'editor')),
      canWrite: Boolean(country && hasRole(session, country.code, config.writeRole ?? 'editor')),
      timezone: country?.timezone ?? 'America/Mexico_City',
    }
  }
  const canWrite = config.globalWrite === 'super' ? session.isSuperAdmin : session.canManageCatalog
  return { countryCode: null, canRead: canWrite, canWrite, timezone: 'America/Mexico_City' }
}

function ViewToggle({ basePath, view }: { basePath: string; view: 'list' | 'calendar' }) {
  return (
    <div className="flex overflow-hidden rounded-md border border-zinc-300 text-sm">
      {(['list', 'calendar'] as const).map(v => (
        <Link
          key={v}
          href={v === 'list' ? basePath : `${basePath}?view=calendar`}
          className={cn('px-3 py-1.5', view === v ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-700 hover:bg-zinc-50')}
        >
          {v === 'list' ? 'Lista' : 'Calendario'}
        </Link>
      ))}
    </div>
  )
}

export async function ResourceListPage({
  resource,
  config,
  basePath,
  searchParams = {},
}: {
  resource: ResourceKey
  config: ResourceConfig
  basePath: string
  searchParams?: { view?: string } & CalendarParams
}) {
  const session = await requireAdminSession()
  const { countryCode, canRead, canWrite, timezone } = access(session, config)
  if (!canRead) notFound()
  if (config.singleton) return <ResourceEditPage resource={resource} config={config} id={singletonId(config, countryCode)} basePath={basePath} />
  if (resource === 'projects' && session.activeCountry) {
    return <ProjectsOrderPage countryCode={session.activeCountry.code} countryName={session.activeCountry.name_es} canEdit={canWrite} />
  }

  const hasCalendar = resource === 'events' && session.activeCountry
  const view = hasCalendar && searchParams.view === 'calendar' ? 'calendar' : 'list'
  const rows = view === 'list' ? await listRecords(config, countryCode) : []
  const scopeLabel = config.scope === 'country' ? session.activeCountry?.name_es : 'Global'
  return (
    <>
      <PageHeader
        title={config.title}
        description={config.description ?? scopeLabel}
        actions={
          <>
            {hasCalendar && <ViewToggle basePath={basePath} view={view} />}
            {canWrite && <ButtonLink href={`${basePath}/new`}>Nuevo {config.singular}</ButtonLink>}
          </>
        }
      />
      {view === 'calendar' && session.activeCountry ? (
        <EventsCalendar country={session.activeCountry} params={searchParams} basePath={basePath} />
      ) : (
        <DataTable columns={config.columns} rows={rows} rowKey={config.pk} hrefBase={basePath} timeZone={timezone} />
      )}
    </>
  )
}

function publicHref(config: ResourceConfig, row: AnyRow | null, id: string | null) {
  if (config.key === 'pages' || config.key === 'site-pages' || config.key === 'site-home') return contentPage(id ?? '')?.href ?? null
  const slug = row?.slug ? String(row.slug) : null
  switch (config.publicPath) {
    case '/':
      return '/' as const
    case '/events/[slug]':
    case '/projects/[slug]':
    case '/brands/[slug]':
    case '/designers/[slug]':
    case '/products/[slug]':
      return slug ? { pathname: config.publicPath, params: { slug } } : null
    case '/solutions/[businessLine]':
      return slug ? { pathname: config.publicPath, params: { businessLine: slug } } : null
    case '/spaces/[sector]':
      return slug ? { pathname: config.publicPath, params: { sector: slug } } : null
    default:
      return null
  }
}

export async function ResourceEditPage({
  resource,
  config,
  id,
  basePath,
}: {
  resource: ResourceKey
  config: ResourceConfig
  id: string | null
  basePath: string
}) {
  const session = await requireAdminSession()
  const { countryCode, canRead, canWrite, timezone } = access(session, config)
  if (!canRead) notFound()

  const record = id ? await loadRecord(config, id, countryCode) : null
  if (id && !record && !config.singleton && !config.upsert) notFound()
  const row = record?.row ?? null
  const initialValues = row ? toFormValues(config, row, record!.bridges, timezone) : emptyValues(config)
  const [options, media] = await Promise.all([loadOptions(config, countryCode), loadMedia(mediaIdsOf(config, row))])

  const siteCountry = countryCode ?? session.activeCountry?.code ?? 'mx'
  const href = publicHref(config, row, id)
  const status = row?.status as string | undefined
  const [viewUrl, draftUrl] = href
    ? await Promise.all([publicUrl(siteCountry, href), status && status !== 'published' ? previewUrl(siteCountry, href) : null])
    : [null, null]

  const aside: ReactNode = (
    <div className="space-y-2 border-t border-zinc-100 pt-3 text-xs text-zinc-500">
      {viewUrl && (!status || status === 'published') && (
        <a className="block font-medium text-zinc-900 underline" href={viewUrl} target="_blank" rel="noreferrer">
          Ver en el sitio ↗
        </a>
      )}
      {draftUrl && (
        <a className="block font-medium text-zinc-900 underline" href={draftUrl} target="_blank" rel="noreferrer">
          Vista previa del borrador ↗
        </a>
      )}
      {resource === 'events' && id && (
        <a className="block font-medium text-zinc-900 underline" href={`/admin/registrations/${id}`}>
          Registros del evento →
        </a>
      )}
      {row?.updated_at ? <p>Última edición: {formatDateTime(row.updated_at, timezone)}</p> : null}
    </div>
  )

  const pageLabel = config.key === 'pages' || config.key === 'site-pages' || config.key === 'site-home' ? contentPage(id ?? '')?.label : null
  const title = pageLabel
    ? config.scope === 'global'
      ? `${pageLabel} · Global`
      : `${pageLabel} · ${session.activeCountry?.name_es ?? ''}`
    : id
      ? config.singleton
        ? config.scope === 'global'
          ? config.title
          : `${config.title} · ${session.activeCountry?.name_es ?? ''}`
        : String(row?.title_es ?? row?.name ?? row?.name_es ?? row?.full_name ?? row?.city ?? row?.platform ?? config.singular)
      : `Nuevo ${config.singular}`

  return (
    <>
      <PageHeader
        title={title}
        description={config.singleton || config.upsert ? config.description : config.title}
        actions={
          (!config.singleton || basePath !== `/admin/${resource}`) && (
            <ButtonLink href={basePath} variant="ghost">
              ← Volver
            </ButtonLink>
          )
        }
      />
      {config.singleton && !row && (
        <Notice tone="amber">{config.scope === 'global' ? 'Aún no hay configuración' : 'Este país aún no tiene configuración'}; al guardar se crea.</Notice>
      )}
      {config.upsert && !row && (
        <Notice tone="amber">
          {config.scope === 'global'
            ? 'Aún no hay contenido global. Un campo vacío no se publica.'
            : 'Aún no hay hero de este país. Lo que dejes vacío no aparece en el sitio.'}
        </Notice>
      )}
      <ResourceForm
        resource={resource}
        id={config.singleton ? singletonId(config, countryCode) : id}
        countryCode={countryCode}
        initialValues={initialValues}
        options={options}
        media={media}
        canEdit={canWrite}
        canDelete={!config.singleton && !config.upsert}
        basePath={basePath}
        aside={aside}
      />
      {id && countryCode && (resource === 'events' || resource === 'projects') && (
        <div className="mt-6 space-y-6 lg:max-w-[calc(100%-304px)]">
          <ContentExtras owner={resource === 'events' ? 'event' : 'project'} id={id} countryCode={countryCode} coverId={(row?.cover_media_id as string) ?? null} canEdit={canWrite} />
        </div>
      )}
      {id && resource === 'products' && countryCode && (
        <div className="mt-6 space-y-6 lg:max-w-[calc(100%-304px)]">
          <ProductExtras productId={id} countryCode={countryCode} coverId={(row?.cover_media_id as string) ?? null} canEdit={canWrite} />
        </div>
      )}
      {id && resource === 'brands' && (
        <div className="mt-6 lg:max-w-[calc(100%-304px)]">
          <BrandGallery id={id} canEdit={canWrite} />
        </div>
      )}
      {id && resource === 'solutions' && (
        <div className="mt-6 lg:max-w-[calc(100%-304px)]">
          <SolutionPageBlock id={id} raw={row?.page_content} canEdit={canWrite} />
        </div>
      )}
      {id && resource === 'spaces' && (
        <div className="mt-6 lg:max-w-[calc(100%-304px)]">
          <SolutionFits owner="spaces" id={id} canEdit={canWrite} />
        </div>
      )}
    </>
  )
}

async function SolutionPageBlock({ id, raw, canEdit }: { id: string; raw: unknown; canEdit: boolean }) {
  const content = parseSolutionPage(raw)
  const ids = solutionPageMediaIds(content)
  const supabase = await createSupabaseServerClient()
  const { data } = ids.length ? await supabase.from('media_assets').select(ADMIN_MEDIA_SELECT).in('id', ids) : { data: [] }
  return <SolutionPageEditor id={id} content={content} media={(data ?? []).map(toAdminMedia)} canEdit={canEdit} />
}

async function SolutionFits({ owner, id, canEdit }: { owner: 'solutions' | 'spaces'; id: string; canEdit: boolean }) {
  const supabase = await createSupabaseServerClient()
  const [{ data: lines }, { data: sectors }, { data: fits }] = await Promise.all([
    supabase.from('business_lines').select('id, name_es, sort').order('sort'),
    supabase.from('sectors').select('id, name_es, sort').order('sort'),
    supabase
      .from('solution_space_fits')
      .select('business_line_id, sector_id, body_es, body_en, image_media_id')
      .eq(owner === 'solutions' ? 'business_line_id' : 'sector_id', id),
  ])
  const byPair = new Map((fits ?? []).map(fit => [`${fit.business_line_id}:${fit.sector_id}`, fit]))
  const rows: SolutionSpaceRow[] =
    owner === 'solutions'
      ? (sectors ?? []).map(sector => {
          const fit = byPair.get(`${id}:${sector.id}`)
          return {
            businessLineId: id,
            sectorId: sector.id,
            label: sector.name_es,
            bodyEs: fit?.body_es ?? '',
            bodyEn: fit?.body_en ?? '',
            imageId: fit?.image_media_id ?? null,
          }
        })
      : (lines ?? []).map(line => {
          const fit = byPair.get(`${line.id}:${id}`)
          return {
            businessLineId: line.id,
            sectorId: id,
            label: line.name_es,
            bodyEs: fit?.body_es ?? '',
            bodyEn: fit?.body_en ?? '',
            imageId: fit?.image_media_id ?? null,
          }
        })
  const imageIds = [...new Set(rows.flatMap(row => (row.imageId ? [row.imageId] : [])))]
  const { data: media } = imageIds.length ? await supabase.from('media_assets').select(ADMIN_MEDIA_SELECT).in('id', imageIds) : { data: [] }
  return (
    <SolutionFitEditor
      title={owner === 'solutions' ? 'Espacios' : 'Soluciones'}
      description={
        owner === 'solutions'
          ? 'Foto y texto de esta solución en cada tipo de espacio. La misma ficha se edita dentro del espacio.'
          : 'Foto y texto de cada solución en este espacio. La misma ficha se edita dentro de la solución.'
      }
      rows={rows}
      media={(media ?? []).map(toAdminMedia)}
      canEdit={canEdit}
    />
  )
}

async function BrandGallery({ id, canEdit }: { id: string; canEdit: boolean }) {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('brand_media')
    .select(`sort, caption_es, caption_en, media_assets(${ADMIN_MEDIA_SELECT})`)
    .eq('brand_id', id)
    .order('sort')
  const gallery = (data ?? [])
    .filter(row => row.media_assets)
    .map(row => ({
      media: toAdminMedia(row.media_assets!),
      captionEs: row.caption_es ?? '',
      captionEn: row.caption_en ?? '',
      isDownloadable: false,
    }))
  return <GalleryEditor owner="brand" ownerId={id} countryCode={null} initialItems={gallery} initialCoverId={null} canEdit={canEdit} />
}

async function ContentExtras({
  owner,
  id,
  countryCode,
  coverId,
  canEdit,
}: {
  owner: 'event' | 'project'
  id: string
  countryCode: string
  coverId: string | null
  canEdit: boolean
}) {
  const supabase = await createSupabaseServerClient()
  let gallery: GalleryItem[] = []
  if (owner === 'event') {
    const { data } = await supabase.from('event_media').select(`sort, media_assets(${ADMIN_MEDIA_SELECT})`).eq('event_id', id).order('sort')
    gallery = (data ?? [])
      .filter(r => r.media_assets)
      .map(r => ({ media: toAdminMedia(r.media_assets!), captionEs: '', captionEn: '', isDownloadable: false }))
  } else {
    const { data } = await supabase
      .from('project_media')
      .select(`sort, caption_es, caption_en, media_assets(${ADMIN_MEDIA_SELECT})`)
      .eq('project_id', id)
      .order('sort')
    gallery = (data ?? [])
      .filter(r => r.media_assets)
      .map(r => {
        const media = toAdminMedia(r.media_assets!)
        return { media, captionEs: r.caption_es ?? '', captionEn: r.caption_en ?? '', isDownloadable: media.isDownloadable }
      })
  }

  const agenda =
    owner === 'event'
      ? ((await supabase.from('event_agenda_items').select('time_label, text_es, text_en').eq('event_id', id).order('sort')).data ?? []).map(
          r => ({ time_label: r.time_label ?? '', text_es: r.text_es, text_en: r.text_en ?? '' }),
        )
      : null

  let previousEditions: { options: PreviousEditionOption[]; ids: string[] } | null = null
  if (owner === 'event') {
    const [{ data: events }, { data: links }] = await Promise.all([
      supabase
        .from('events')
        .select(`id, title_es, starts_at, ends_at, timezone, status, cover:media_assets!events_cover_media_id_fkey(${ADMIN_MEDIA_SELECT})`)
        .eq('country_code', countryCode)
        .neq('id', id),
      supabase.from('event_previous_editions').select('previous_event_id').eq('event_id', id),
    ])
    const options = (events ?? []).map(event => {
      const cover = event.cover
      return {
        id: event.id,
        title: event.title_es,
        startsAt: event.starts_at,
        when: formatDateTime(event.starts_at, event.timezone, false),
        status: event.status,
        thumbUrl: cover ? toAdminMedia(cover).thumbUrl : null,
        past: isPastDate(event.ends_at ?? event.starts_at),
      }
    })
    const known = new Set(options.map(option => option.id))
    previousEditions = {
      options,
      ids: (links ?? []).map(link => link.previous_event_id).filter(eventId => known.has(eventId)),
    }
  }

  return (
    <>
      {agenda && <AgendaEditor eventId={id} initialItems={agenda} canEdit={canEdit} />}
      {previousEditions && (
        <PreviousEditionsEditor eventId={id} options={previousEditions.options} initialIds={previousEditions.ids} canEdit={canEdit} />
      )}
      <GalleryEditor owner={owner} ownerId={id} countryCode={countryCode} initialItems={gallery} initialCoverId={coverId} canEdit={canEdit} />
    </>
  )
}
