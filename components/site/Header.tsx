'use client'
import { useEffect, useState, useSyncExternalStore } from 'react'
import { useTranslations } from 'next-intl'
import type { NavLink } from '@/lib/types/site'
import { SubnavBar, SubnavProvider, useSubnav } from './SubnavBar'

const noopSubscribe = () => () => {}

type Props = {
  logoHref: string
  links: NavLink[]
  cta: NavLink
  /** Fraction of the viewport height after which the header turns solid. */
  threshold?: number
  /** Start solid. Used when the page has no dark hero behind the bar. */
  solid?: boolean
  /** Extra controls (country / language switchers). */
  tools?: React.ReactNode
}

export function Header(props: Props) {
  return (
    <SubnavProvider>
      <HeaderBar {...props} />
    </SubnavProvider>
  )
}

function HeaderBar({ logoHref, links, cta, threshold = 0.75, solid = false, tools }: Props) {
  const t = useTranslations('common')
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const subnav = useSubnav()
  // Read from the browser: on the server the pathname is the internal rewritten route, not the visible URL.
  const pathname = useSyncExternalStore(noopSubscribe, () => window.location.pathname, () => null)
  const matches = (href: string) => pathname !== null && (pathname === href || pathname.startsWith(`${href}/`))
  const isActive = (link: NavLink) => matches(link.href) || !!link.items?.some(item => matches(item.href))

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * threshold)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  useEffect(() => {
    if (!menuOpen) return
    const root = document.documentElement
    root.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setClosing(true)
      setMenuOpen(false)
    }
    const desktop = window.matchMedia('(min-width: 1025px)')
    const onDesktop = () => {
      if (!desktop.matches) return
      setClosing(false)
      setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    desktop.addEventListener('change', onDesktop)
    return () => {
      root.style.overflow = ''
      window.removeEventListener('keydown', onKey)
      desktop.removeEventListener('change', onDesktop)
    }
  }, [menuOpen])

  // While the panel slides back up the logo and button stay dark, so they never vanish against it.
  const barSolid = solid || scrolled
  const dark = barSolid || menuOpen || closing
  const navColor = dark ? '#2c2920' : '#ffffff'
  const toggleMenu = () => {
    if (menuOpen) setClosing(true)
    setMenuOpen(!menuOpen)
  }
  const close = () => {
    if (!menuOpen) return
    setClosing(true)
    setMenuOpen(false)
  }

  return (
    <header data-solid={barSolid ? 'true' : 'false'} style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60, background: barSolid ? '#faf7f1' : 'transparent', borderBottom: `1px solid ${dark ? 'rgba(20,18,12,0.08)' : 'rgba(255,255,255,0.14)'}`, transition: 'background 0.4s ease, border-color 0.4s ease' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '18px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href={logoHref}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dark ? '/images/logo-iho-black.png' : '/images/logo-iho-white.png'} alt="IHO" style={{ height: 36, display: 'block' }} />
        </a>
        <nav
          className={menuOpen ? 'iho-nav-open' : ''}
          onTransitionEnd={event => {
            if (event.target === event.currentTarget && event.propertyName === 'transform' && !menuOpen) setClosing(false)
          }}
          style={{ display: 'flex', alignItems: 'center', gap: 34, fontFamily: '"Source Sans 3", sans-serif', fontSize: 15, fontWeight: 500, color: navColor }}
        >
          {links.map(l => {
            if (!l.items) {
              return <a key={l.href} href={l.href} className="iho-nav-link" aria-current={isActive(l) ? 'page' : undefined} onClick={close}>{l.label}</a>
            }
            const id = `iho-subnav-${l.href.split('/').filter(Boolean).pop() ?? 'menu'}`
            const isOpen = subnav.open === id
            return (
              <div key={l.href} className={`iho-nav-group${isOpen ? ' is-open' : ''}`}>
                <button type="button" className="iho-nav-link iho-nav-toggle" aria-current={isActive(l) ? 'page' : undefined} aria-expanded={isOpen} aria-controls={id} onClick={() => subnav.toggle(id)}>
                  {l.label}
                </button>
                {isOpen && (
                  <SubnavBar
                    id={id}
                    label={l.label}
                    items={l.items.map(item => ({ href: item.href, label: item.label, current: matches(item.href), arrow: item.arrow }))}
                  />
                )}
              </div>
            )
          })}
          <a href={cta.href} className="iho-btn" onClick={close} style={{ display: 'inline-flex', alignItems: 'center', background: '#ef483d', color: '#fff', padding: '10px 20px', borderRadius: 30, fontWeight: 600, textDecoration: 'none' }}>
            {cta.label}
          </a>
          {tools && <div className="iho-header-tools" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>{tools}</div>}
        </nav>
        <button id="iho-menu-btn" className={menuOpen ? 'is-open' : ''} aria-label={t('menu')} aria-expanded={menuOpen} onClick={toggleMenu} style={{ color: dark ? '#17150f' : '#ffffff' }}>
          <span /><span /><span />
        </button>
      </div>
    </header>
  )
}
