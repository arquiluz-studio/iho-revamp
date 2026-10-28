import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ResourceListPage } from '@/components/admin/resource-pages'
import { resolveResource } from './resolve'

type Props = { params: Promise<{ resource: string }> }

const MOVED = new Set(['solutions', 'spaces'])

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { resource } = await params
  if (MOVED.has(resource)) return { title: resource === 'solutions' ? 'Soluciones' : 'Espacios' }
  return { title: resolveResource(resource).config.title }
}

export default async function Page({ params }: Props) {
  const { resource } = await params
  if (MOVED.has(resource)) redirect(`/admin/global/content/${resource}`)
  return <ResourceListPage {...resolveResource(resource)} />
}
