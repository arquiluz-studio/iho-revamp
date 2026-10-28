import { ResourceEditPage } from '@/components/admin/resource-pages'
import { RESOURCES } from '@/lib/admin/resources'

export default function Page() {
  return <ResourceEditPage resource="spaces" config={RESOURCES.spaces} id={null} basePath="/admin/global/content/spaces" />
}
