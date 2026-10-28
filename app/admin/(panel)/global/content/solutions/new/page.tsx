import { ResourceEditPage } from '@/components/admin/resource-pages'
import { RESOURCES } from '@/lib/admin/resources'

export default function Page() {
  return <ResourceEditPage resource="solutions" config={RESOURCES.solutions} id={null} basePath="/admin/global/content/solutions" />
}
