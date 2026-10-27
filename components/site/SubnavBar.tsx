'use client'
import { createContext, useContext, useEffect, useRef, useState } from 'react'

type SubnavState = { open: string | null; toggle: (id: string) => void; close: () => void }

const SubnavContext = createContext<SubnavState>({ open: null, toggle: () => {}, close: () => {} })

/** Only one secondary bar (country, solutions, spaces…) is open at a time; clicks outside the header or Escape close it. */
export function SubnavProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (!(e.target as Element).closest?.('header')) setOpen(null)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <SubnavContext.Provider value={{ open, toggle: id => setOpen(o => (o === id ? null : id)), close: () => setOpen(null) }}>
      {children}
    </SubnavContext.Provider>
  )
}

export const useSubnav = () => useContext(SubnavContext)

export type SubnavItem = { href: string; label: string; current?: boolean; arrow?: boolean; onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void }

/** Full-width bar under the header (positioned against the fixed `<header>`), items aligned with the first nav link. */
export function SubnavBar({ id, label, items }: { id: string; label: string; items: SubnavItem[] }) {
  const [start, setStart] = useState<number | null>(null)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const align = () => {
      const firstLink = root.current?.closest('header')?.querySelector('nav > a, nav > button')
      setStart(firstLink ? firstLink.getBoundingClientRect().left : null)
    }
    align()
    window.addEventListener('resize', align)
    return () => window.removeEventListener('resize', align)
  }, [])

  return (
    <div ref={root} id={id} className="iho-subnav">
      <div className="iho-subnav-inner" style={start === null ? undefined : ({ '--iho-bar-start': `${start}px` } as React.CSSProperties)}>
        <span className="iho-subnav-label">{label}</span>
        <ul role="list" aria-label={label}>
          {items.map(item => (
            <li key={item.href}>
              <a href={item.href} className={item.arrow ? 'iho-subnav-out' : undefined} onClick={item.onClick} aria-current={item.current ? 'true' : undefined}>
                {item.arrow && (
                  <svg aria-hidden="true" width={10} height={10} viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="square">
                    <path d="M1.5 8.5 8 2M3 1.5h5.5V7" />
                  </svg>
                )}
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
