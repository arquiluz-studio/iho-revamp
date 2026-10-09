import { ResourceEditPage } from '@/components/admin/resource-pages'
import { resolveResource } from '../resolve'

export default async function Page({ params }: { params: Promise<{ resource: string }> }) {
  const resolved = resolveResource((await params).resource)
  return <ResourceEditPage {...resolved} id={null} />
}
