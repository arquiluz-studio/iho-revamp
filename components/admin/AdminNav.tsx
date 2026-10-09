'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from './ui'

export type NavSection = { title?: string; items: { href: string; label: string; exact?: boolean }[] }

/** On the admin host the visible path has no `/admin` prefix; both forms map to the same item. */
function normalize(pathname: string) {
  return pathname.startsWith('/admin') ? pathname : `/admin${pathname === '/' ? '' : pathname}`
}

export function AdminNav({ sections }: { sections: NavSection[] }) {
  const pathname = normalize(usePathname())
  return (
    <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
      {sections.map((section, i) => (
        <div key={section.title ?? i}>
          {section.title && <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{section.title}</p>}
          <ul className="space-y-0.5">
            {section.items.map(item => {
              const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'block rounded-md px-2 py-1.5 text-sm',
                      active ? 'bg-zinc-100 font-medium text-zinc-900' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
