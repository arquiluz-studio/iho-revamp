import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ResourceEditPage } from '@/components/admin/resource-pages'
import { RESOURCES } from '@/lib/admin/resources'
import { requireAdminSession } from '@/lib/admin/session'
import { contentPage, isCountryPageKey } from '@/lib/content/static-pages'

type Props = { params: Promise<{ page: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = contentPage((await params).page)
  return { title: item ? `${item.label} · Contenido - Global` : 'Contenido - Global' }
}

export default async function GlobalContentPageEditor({ params }: Props) {
  const { page } = await params
  const session = await requireAdminSession()
  if (!session.isGlobalScope || !session.isSuperAdmin) notFound()
  if (!contentPage(page)) notFound()

  if (page === 'home') {
    return <ResourceEditPage resource="site-home" config={RESOURCES['site-home']} id="home" basePath="/admin/global/content" />
  }
  if (!isCountryPageKey(page)) notFound()
  return <ResourceEditPage resource="site-pages" config={RESOURCES['site-pages']} id={page} basePath="/admin/global/content" />
}
