import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { emptyValues, type ResourceConfig, type ResourceKey } from '@/lib/admin/resources'
import { listRecords, loadMedia, loadOptions, loadRecord, mediaIdsOf } from '@/lib/admin/data'
import { toFormValues } from '@/lib/admin/form-schema'
import { ADMIN_MEDIA_SELECT, toAdminMedia } from '@/lib/admin/media'
import { previewUrl, publicUrl } from '@/lib/admin/public-url'
import { hasRole, requireAdminSession, type AdminSession } from '@/lib/admin/session'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { AgendaEditor } from './AgendaEditor'
import { PriceListExtras, ProductExtras, WarehouseExtras } from './catalog/CatalogExtras'
import { formatDateTime } from '@/lib/admin/format'
import { DataTable } from './DataTable'
import { GalleryEditor, type GalleryItem } from './GalleryEditor'
import { ResourceForm } from './ResourceForm'
import { ButtonLink, Notice, PageHeader } from './ui'

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

export async function ResourceListPage({ resource, config, basePath }: { resource: ResourceKey; config: ResourceConfig; basePath: string }) {
  const session = await requireAdminSession()
  const { countryCode, canRead, canWrite, timezone } = access(session, config)
  if (!canRead) notFound()
  if (config.singleton) return <ResourceEditPage resource={resource} config={config} id={countryCode} basePath={basePath} />

  const rows = await listRecords(config, countryCode)
  const scopeLabel = config.scope === 'country' ? session.activeCountry?.name_es : 'Global'
  return (
    <>
      <PageHeader
        title={config.title}
        description={config.description ?? scopeLabel}
        actions={
          <>
            {resource === 'events' && (
              <ButtonLink href="/admin/calendar" variant="outline">
                Ver calendario
              </ButtonLink>
            )}
            {canWrite && <ButtonLink href={`${basePath}/new`}>Nuevo {config.singular}</ButtonLink>}
          </>
        }
      />
      <DataTable columns={config.columns} rows={rows} rowKey={config.pk} hrefBase={basePath} timeZone={timezone} />
    </>
  )
}

function publicHref(config: ResourceConfig, row: AnyRow | null) {
  const slug = row?.slug ? String(row.slug) : null
  switch (config.publicPath) {
    case '/':
      return '/' as const
    case '/events/[slug]':
    case '/projects/[slug]':
    case '/brands/[slug]':
    case '/products/[slug]':
      return slug ? { pathname: config.publicPath, params: { slug } } : null
    case '/areas/[businessLine]':
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
  if (id && !record && !config.singleton) notFound()
  const row = record?.row ?? null
  const initialValues = row ? toFormValues(config, row, record!.bridges, timezone) : emptyValues(config)
  const [options, media] = await Promise.all([loadOptions(config), loadMedia(mediaIdsOf(config, row))])

  const siteCountry = countryCode ?? session.activeCountry?.code ?? 'mx'
  const href = publicHref(config, row)
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

  const title = id
    ? config.singleton
      ? `${config.title} · ${session.activeCountry?.name_es ?? ''}`
      : String(row?.title_es ?? row?.name ?? row?.name_es ?? row?.full_name ?? row?.city ?? row?.platform ?? config.singular)
    : `Nuevo ${config.singular}`

  return (
    <>
      <PageHeader
        title={title}
        description={config.singleton ? config.description : config.title}
        actions={
          !config.singleton && (
            <ButtonLink href={basePath} variant="ghost">
              ← Volver
            </ButtonLink>
          )
        }
      />
      {config.singleton && !row && <Notice tone="amber">Este país aún no tiene configuración; al guardar se crea.</Notice>}
      <ResourceForm
        resource={resource}
        id={config.singleton ? countryCode : id}
        countryCode={countryCode}
        initialValues={initialValues}
        options={options}
        media={media}
        canEdit={canWrite}
        canDelete={!config.singleton}
        basePath={basePath}
        aside={aside}
      />
      {id && countryCode && (resource === 'events' || resource === 'projects') && (
        <div className="mt-6 space-y-6 lg:max-w-[calc(100%-304px)]">
          <ContentExtras owner={resource === 'events' ? 'event' : 'project'} id={id} countryCode={countryCode} coverId={(row?.cover_media_id as string) ?? null} canEdit={canWrite} />
        </div>
      )}
      {id && (resource === 'products' || resource === 'price-lists' || resource === 'warehouses') && (
        <div className="mt-6 space-y-6 lg:max-w-[calc(100%-304px)]">
          {resource === 'products' && <ProductExtras productId={id} coverId={(row?.cover_media_id as string) ?? null} canEdit={canWrite} />}
          {resource === 'price-lists' && <PriceListExtras priceListId={id} currency={String(row?.currency ?? '')} canEdit={canWrite} />}
          {resource === 'warehouses' && <WarehouseExtras warehouseId={id} canEdit={canWrite} />}
        </div>
      )}
    </>
  )
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

  return (
    <>
      {agenda && <AgendaEditor eventId={id} initialItems={agenda} canEdit={canEdit} />}
      <GalleryEditor owner={owner} ownerId={id} countryCode={countryCode} initialItems={gallery} initialCoverId={coverId} canEdit={canEdit} />
    </>
  )
}
