import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { GlobalHeroPreview } from '@/components/admin/GlobalHeroPreview'
import { PageSourceSwitch } from '@/components/admin/PageSourceSwitch'
import { ResourceEditPage } from '@/components/admin/resource-pages'
import { RESOURCES } from '@/lib/admin/resources'
import { hasRole, requireAdminSession } from '@/lib/admin/session'
import { contentPage, isContentPageKey, isCountryPageKey } from '@/lib/content/static-pages'
import { createSupabaseServerClient } from '@/lib/supabase/server'

type Props = { params: Promise<{ page: string }>; searchParams: Promise<{ fuente?: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = contentPage((await params).page)
  return { title: item ? `${item.label} · Contenido` : 'Contenido' }
}

export default async function ContentPageEditor({ params, searchParams }: Props) {
  const { page } = await params
  const { fuente } = await searchParams
  if (!isContentPageKey(page)) notFound()
  const session = await requireAdminSession()
  const country = session.activeCountry
  if (!country || !hasRole(session, country.code, 'admin')) notFound()

  const supabase = await createSupabaseServerClient()
  const { data: choice } = await supabase
    .from('country_page_choices')
    .select('uses_global')
    .eq('country_code', country.code)
    .eq('page_key', page)
    .maybeSingle()
  const usesGlobal = choice?.uses_global !== false
  const viewingGlobal = fuente === 'pais' ? false : fuente === 'global' ? true : usesGlobal

  return (
    <>
      <PageSourceSwitch countryCode={country.code} pageKey={page} usesGlobal={usesGlobal} viewingGlobal={viewingGlobal} />
      {viewingGlobal ? (
        <GlobalHeroPreview pageKey={page} />
      ) : page === 'home' ? (
        <ResourceEditPage resource="home" config={RESOURCES.home} id={country.code} basePath="/admin/content" />
      ) : isCountryPageKey(page) ? (
        <ResourceEditPage resource="pages" config={RESOURCES.pages} id={page} basePath="/admin/content" />
      ) : null}
    </>
  )
}
