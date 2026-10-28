import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ButtonLink, Card, PageHeader } from '@/components/admin/ui'
import { requireAdminSession } from '@/lib/admin/session'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const KINDS = {
  solutions: {
    title: 'Soluciones',
    description: 'Cada solución tiene su página. El texto y las fotos del layout se editan dentro.',
    portada: 'Portada de /soluciones',
    create: 'Nueva solución',
  },
  spaces: {
    title: 'Espacios',
    description: 'Cada espacio tiene su ficha. La portada de /espacios se edita aparte.',
    portada: 'Portada de /espacios',
    create: 'Nuevo espacio',
  },
} as const

/** List of solutions or spaces inside Contenido global. */
export async function TaxonomyContentList({ kind }: { kind: keyof typeof KINDS }) {
  const session = await requireAdminSession()
  if (!session.isGlobalScope || !session.canManageCatalog) notFound()
  const meta = KINDS[kind]
  const supabase = await createSupabaseServerClient()
  const query =
    kind === 'solutions'
      ? supabase.from('business_lines').select('id, name_es, slug, sort').order('sort')
      : supabase.from('sectors').select('id, name_es, slug, sort').order('sort')
  const { data } = await query

  return (
    <>
      <PageHeader
        title={meta.title}
        description={meta.description}
        actions={
          <>
            {session.isSuperAdmin && (
              <ButtonLink href={`/admin/global/content/${kind}/portada`} variant="outline">
                {meta.portada}
              </ButtonLink>
            )}
            <ButtonLink href={`/admin/global/content/${kind}/new`}>{meta.create}</ButtonLink>
          </>
        }
      />
      <Card>
        <ul className="divide-y divide-zinc-100">
          {(data ?? []).map(row => (
            <li key={row.id}>
              <Link href={`/admin/global/content/${kind}/${row.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-zinc-50">
                <span className="text-sm font-medium text-zinc-900">{row.name_es}</span>
                <span className="text-xs text-zinc-400">{row.slug}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </>
  )
}
