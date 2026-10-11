import type { Metadata } from 'next'
import { ResourceListPage } from '@/components/admin/resource-pages'
import { resolveResource } from './resolve'

type Props = {
  params: Promise<{ resource: string }>
  searchParams: Promise<{ view?: string; range?: string; date?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: resolveResource((await params).resource).config.title }
}

export default async function Page({ params, searchParams }: Props) {
  return <ResourceListPage {...resolveResource((await params).resource)} searchParams={await searchParams} />
}
