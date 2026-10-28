import { redirect } from 'next/navigation'
import { ResourceEditPage } from '@/components/admin/resource-pages'
import { resolveResource } from '../resolve'

const MOVED = new Set(['solutions', 'spaces'])

export default async function Page({ params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params
  if (MOVED.has(resource)) redirect(`/admin/global/content/${resource}/new`)
  return <ResourceEditPage {...resolveResource(resource)} id={null} />
}
