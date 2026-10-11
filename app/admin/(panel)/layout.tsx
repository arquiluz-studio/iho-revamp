import type { ReactNode } from 'react'
import Link from 'next/link'
import { signOut } from '@/app/admin/actions/session'
import { CountrySelector } from '@/components/admin/CountrySelector'
import { AdminNav, type NavSection } from '@/components/admin/AdminNav'
import { Button } from '@/components/admin/ui'
import { ROLE_LABELS, GLOBAL_ROLE_LABELS, ADMIN_GLOBAL_SCOPE, atLeast } from '@/lib/admin/roles'
import { requireAdminSession } from '@/lib/admin/session'

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const session = await requireAdminSession()
  const role = session.activeCountry?.role

  const sections: NavSection[] = [
    {
      items: [
        { href: '/admin', label: 'Dashboard', exact: true },
        ...(session.isGlobalScope && session.isSuperAdmin ? [{ href: '/admin/global/content', label: 'Contenido - Global' }] : []),
      ],
    },
  ]
  if (session.activeCountry) {
    sections.push(
      {
        title: 'Contactos',
        items: [{ href: '/admin/leads', label: 'Leads' }],
      },
      {
        title: `Contenido · ${session.activeCountry.name_es}`,
        items: [
          ...(atLeast(role, 'admin') ? [{ href: '/admin/content', label: 'Contenido' }] : []),
          { href: '/admin/events', label: 'Eventos' },
          { href: '/admin/projects', label: 'Proyectos' },
        ],
      },
      {
        title: 'Catálogo',
        items: [
          { href: '/admin/country-brands', label: 'Marcas del país' },
          ...(atLeast(role, 'admin') ? [{ href: '/admin/catalog-brands', label: 'Marcas comerciales' }] : []),
          { href: '/admin/products', label: 'Catálogo' },
        ],
      },
    )
    if (atLeast(role, 'admin') && !session.isSuperAdmin) sections.push({ title: 'Equipo IHO', items: [{ href: '/admin/users', label: 'Usuarios' }] })
    sections.push({
      title: 'Ajustes',
      items: [
        { href: '/admin/team', label: 'Equipo' },
        ...(atLeast(role, 'admin') ? [{ href: '/admin/offices', label: 'Oficinas' }] : []),
        { href: '/admin/socials', label: 'Redes sociales' },
      ],
    })
  }
  if (session.isGlobalScope) {
    sections.push({
      title: 'Ajustes Globales',
      items: [
        { href: '/admin/global/brands', label: 'Marcas' },
        { href: '/admin/global/designers', label: 'Diseñadores' },
        { href: '/admin/global/solutions', label: 'Soluciones' },
        { href: '/admin/global/spaces', label: 'Espacios' },
        ...(session.isSuperAdmin
          ? [
              { href: '/admin/global/countries', label: 'Países' },
              { href: '/admin/global/stats', label: 'Estadísticas' },
              { href: '/admin/users', label: 'Usuarios' },
              { href: '/admin/global/audit', label: 'Auditoría' },
            ]
          : []),
      ],
    })
  }

  const roleLabel = session.profile.global_role
    ? GLOBAL_ROLE_LABELS[session.profile.global_role]
    : role
      ? ROLE_LABELS[role]
      : 'Sin rol'

  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 flex h-dvh w-60 shrink-0 flex-col border-r border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-5 py-4">
          <Link href="/admin" className="inline-flex items-end gap-2.5">
            <img src="/images/logo-iho-red.png" alt="IHO" className="h-8 w-auto" />
            <span className="text-2xl font-bold leading-none tracking-wide text-zinc-900">CMS</span>
          </Link>
        </div>
        {(session.countries.length > 0 || session.canManageCatalog) && (
          <div className="border-b border-zinc-100 px-4 py-3">
            <CountrySelector
              countries={session.countries.map(c => ({ code: c.code, name: c.name_es }))}
              active={session.isGlobalScope ? ADMIN_GLOBAL_SCOPE : (session.activeCountry?.code ?? '')}
              showGlobal={session.canManageCatalog}
            />
          </div>
        )}
        <AdminNav sections={sections} />
        <div className="border-t border-zinc-100 px-4 py-3">
          <p className="truncate text-xs font-medium text-zinc-800">{session.profile.full_name || session.email}</p>
          <p className="truncate text-xs text-zinc-500">{roleLabel}</p>
          <form action={signOut} className="mt-2">
            <Button type="submit" variant="ghost" size="sm" className="-ml-3">
              Cerrar sesión
            </Button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-8 py-8">{children}</main>
    </div>
  )
}
