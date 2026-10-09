import { notFound } from 'next/navigation'
import { GLOBAL_RESOURCES, RESOURCES, type ResourceKey } from '@/lib/admin/resources'

const ALLOWED: ResourceKey[] = GLOBAL_RESOURCES

export function resolveResource(key: string) {
  if (!ALLOWED.includes(key as ResourceKey)) notFound()
  const resource = key as ResourceKey
  return { resource, config: RESOURCES[resource], basePath: `/admin/global/${resource}` }
}
