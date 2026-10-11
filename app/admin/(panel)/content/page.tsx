import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Card, PageHeader } from '@/components/admin/ui'
import { hasRole, requireAdminSession } from '@/lib/admin/session'
import { CONTENT_PAGES } from '@/lib/content/static-pages'
import { getPathname } from '@/i18n/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Contenido' }

export default async function ContentIndexPage() {
  const session = await requireAdminSession()
  const country = session.activeCountry
  if (!country || !hasRole(session, country.code, 'admin')) notFound()

  const supabase = await createSupabaseServerClient()
  const { data: choices } = await supabase.from('country_page_choices').select('page_key, uses_global').eq('country_code', country.code)
  const own = new Set((choices ?? []).filter(choice => !choice.uses_global).map(choice => choice.page_key))

  return (
    <>
      <PageHeader title="Contenido" description={`Páginas de ${country.name_es}. Cada una puede usar el contenido global o el de este país.`} />
      <Card>
        <ul className="divide-y divide-zinc-100">
          {CONTENT_PAGES.map(page => (
            <li key={page.key}>
              <Link href={`/admin/content/${page.key}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-zinc-50">
                <span className="text-sm font-medium text-zinc-900">{page.label}</span>
                <span className="text-xs text-zinc-400">
                  {own.has(page.key) ? 'De este país' : 'Global'}
                  <span className="mx-2 text-zinc-300">·</span>
                  {getPathname({ href: page.href, locale: 'es' })}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </>
  )
}
