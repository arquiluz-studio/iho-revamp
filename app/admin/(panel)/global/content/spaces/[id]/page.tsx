import { ResourceEditPage } from '@/components/admin/resource-pages'
import { RESOURCES } from '@/lib/admin/resources'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ResourceEditPage resource="spaces" config={RESOURCES.spaces} id={decodeURIComponent(id)} basePath="/admin/global/content/spaces" />
}
