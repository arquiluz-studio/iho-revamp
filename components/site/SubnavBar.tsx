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

export type SubnavItem = {
  href: string
  label: string
  current?: boolean
  arrow?: boolean
  hrefLang?: string
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
}

function SubnavList({ label, items }: { label: string; items: SubnavItem[] }) {
  return (
    <ul role="list" aria-label={label}>
      {items.map(item => (
        <li key={item.href}>
          <a href={item.href} hrefLang={item.hrefLang} className={item.arrow ? 'iho-subnav-out' : undefined} onClick={item.onClick} aria-current={item.current ? 'true' : undefined}>
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
  )
}

/** Full-width bar under the header (positioned against the fixed `<header>`), items aligned with the first nav link. */
export function SubnavBar({ id, label, items, aside, className }: {
  id: string
  label: string
  items: SubnavItem[]
  /** Optional group pinned to the right of the bar (language). */
  aside?: { label: string; items: SubnavItem[] }
  className?: string
}) {
  const [start, setStart] = useState<number | null>(null)
  const [ctaStart, setCtaStart] = useState<number | null>(null)
  const [localeEnd, setLocaleEnd] = useState<number | null>(null)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const textNode = (el: Element | null | undefined) =>
      el && [...el.childNodes].find(node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim())
    const align = () => {
      const header = root.current?.closest('header')
      const firstLink = header?.querySelector('nav > a, nav > button')
      setStart(firstLink ? firstLink.getBoundingClientRect().left : null)
      const ctaText = textNode(header?.querySelector('nav > a.iho-btn'))
      if (ctaText) {
        const range = document.createRange()
        range.setStart(ctaText, 0)
        range.setEnd(ctaText, 1)
        setCtaStart(range.getBoundingClientRect().left)
      } else setCtaStart(null)
      const localeText = textNode(header?.querySelector('.iho-switcher-locale'))
      if (localeText) {
        const value = localeText.textContent ?? ''
        const range = document.createRange()
        range.setStart(localeText, value.length - 1)
        range.setEnd(localeText, value.length)
        setLocaleEnd(range.getBoundingClientRect().right)
      } else setLocaleEnd(null)
    }
    align()
    window.addEventListener('resize', align)
    return () => window.removeEventListener('resize', align)
  }, [])

  const innerStyle = {
    ...(start != null ? { '--iho-bar-start': `${start}px` } : {}),
    ...(ctaStart != null ? { '--iho-cta-start': `${ctaStart}px` } : {}),
    ...(localeEnd != null ? { '--iho-locale-end': `${localeEnd}px` } : {}),
  } as React.CSSProperties
  const innerClass = ['iho-subnav-inner', ctaStart != null && 'has-cta', localeEnd != null && 'has-locale'].filter(Boolean).join(' ')

  return (
    <div ref={root} id={id} className={className ? `iho-subnav ${className}` : 'iho-subnav'}>
      <div className={innerClass} style={Object.keys(innerStyle).length ? innerStyle : undefined}>
        <span className="iho-subnav-label">{label}</span>
        <SubnavList label={label} items={items} />
        {aside && (
          <div className="iho-subnav-aside">
            <span className="iho-subnav-label">{aside.label}</span>
            <SubnavList label={aside.label} items={aside.items} />
          </div>
        )}
      </div>
    </div>
  )
}
