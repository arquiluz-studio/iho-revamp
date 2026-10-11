import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Card, PageHeader } from '@/components/admin/ui'
import { requireAdminSession } from '@/lib/admin/session'
import { CONTENT_PAGES } from '@/lib/content/static-pages'
import { getPathname } from '@/i18n/navigation'

export const metadata: Metadata = { title: 'Contenido - Global' }

export default async function GlobalContentIndexPage() {
  const session = await requireAdminSession()
  if (!session.isGlobalScope || !session.isSuperAdmin) notFound()

  return (
    <>
      <PageHeader title="Contenido - Global" description="Estas páginas se muestran en los países que eligen el contenido global." />
      <Card>
        <ul className="divide-y divide-zinc-100">
          {CONTENT_PAGES.map(page => (
            <li key={page.key}>
              <Link href={`/admin/global/content/${page.key}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-zinc-50">
                <span className="text-sm font-medium text-zinc-900">{page.label}</span>
                <span className="text-xs text-zinc-400">{getPathname({ href: page.href, locale: 'es' })}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </>
  )
}
