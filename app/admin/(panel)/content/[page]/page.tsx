import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ResourceEditPage } from '@/components/admin/resource-pages'
import { RESOURCES } from '@/lib/admin/resources'
import { requireAdminSession } from '@/lib/admin/session'
import { contentPage, isCountryPageKey } from '@/lib/content/static-pages'

type Props = { params: Promise<{ page: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = contentPage((await params).page)
  return { title: item ? `${item.label} · Contenido` : 'Contenido' }
}

export default async function ContentPageEditor({ params }: Props) {
  const { page } = await params
  const item = contentPage(page)
  if (!item) notFound()

  if (page === 'home') {
    const session = await requireAdminSession()
    const countryCode = session.activeCountry?.code
    if (!countryCode) notFound()
    return <ResourceEditPage resource="home" config={RESOURCES.home} id={countryCode} basePath="/admin/content" />
  }

  if (!isCountryPageKey(page)) notFound()
  return <ResourceEditPage resource="pages" config={RESOURCES.pages} id={page} basePath="/admin/content" />
}
