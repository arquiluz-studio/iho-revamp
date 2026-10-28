import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ResourceEditPage } from '@/components/admin/resource-pages'
import { RESOURCES } from '@/lib/admin/resources'
import { requireAdminSession } from '@/lib/admin/session'

export const metadata: Metadata = { title: 'Portada de soluciones · Contenido' }

export default async function Page() {
  const session = await requireAdminSession()
  if (!session.isGlobalScope || !session.isSuperAdmin) notFound()
  return <ResourceEditPage resource="site-pages" config={RESOURCES['site-pages']} id="solutions" basePath="/admin/global/content/solutions" />
}
