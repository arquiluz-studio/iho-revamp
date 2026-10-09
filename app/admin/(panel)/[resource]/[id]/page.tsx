import { ResourceEditPage } from '@/components/admin/resource-pages'
import { resolveResource } from '../resolve'

export default async function Page({ params }: { params: Promise<{ resource: string; id: string }> }) {
  const { resource, id } = await params
  return <ResourceEditPage {...resolveResource(resource)} id={decodeURIComponent(id)} />
}
