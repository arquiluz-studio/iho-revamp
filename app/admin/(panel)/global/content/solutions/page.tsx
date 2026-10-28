import type { Metadata } from 'next'
import { TaxonomyContentList } from '@/components/admin/TaxonomyContentList'

export const metadata: Metadata = { title: 'Soluciones · Contenido' }

export default function Page() {
  return <TaxonomyContentList kind="solutions" />
}
