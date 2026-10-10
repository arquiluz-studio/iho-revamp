'use client'
import { useEffect, useState, useSyncExternalStore } from 'react'
import { useTranslations } from 'next-intl'
import type { NavLink } from '@/lib/types/site'

const noopSubscribe = () => () => {}

type Props = {
  logoHref: string
  links: NavLink[]
  cta: NavLink
  /** Secondary button next to the CTA, to the group's online store. */
  shop?: NavLink
  /** Fraction of the viewport height after which the header turns solid. */
  threshold?: number
  /** Extra controls (country / language switchers). */
  tools?: React.ReactNode
}

export function Header({ logoHref, links, cta, shop, threshold = 0.75, tools }: Props) {
  const t = useTranslations('common')
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  // Read from the browser: on the server the pathname is the internal rewritten route, not the visible URL.
  const pathname = useSyncExternalStore(noopSubscribe, () => window.location.pathname, () => null)
  const isActive = (link: NavLink) => pathname !== null && (pathname === link.href || pathname.startsWith(`${link.href}/`))

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * threshold)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  const solid = menuOpen || scrolled
  const navColor = solid ? '#2c2920' : '#ffffff'
  const close = () => setMenuOpen(false)

  return (
    <header data-solid={scrolled ? 'true' : 'false'} style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60, background: scrolled ? '#faf7f1' : 'transparent', borderBottom: `1px solid ${scrolled ? 'rgba(20,18,12,0.08)' : 'rgba(255,255,255,0.14)'}`, transition: 'background 0.4s ease, border-color 0.4s ease' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '18px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href={logoHref}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={scrolled ? '/images/logo-iho-black.png' : '/images/logo-iho-white.png'} alt="IHO" style={{ height: 36, display: 'block' }} />
        </a>
        <nav className={menuOpen ? 'iho-nav-open' : ''} style={{ display: 'flex', alignItems: 'center', gap: 34, fontFamily: '"Source Sans 3", sans-serif', fontSize: 15, fontWeight: 500, color: navColor }}>
          {links.map(l => (
            <a key={l.href} href={l.href} className="iho-nav-link" aria-current={isActive(l) ? 'page' : undefined} onClick={close}>{l.label}</a>
          ))}
          {shop && (
            <a href={shop.href} className="iho-btn" onClick={close} style={{ display: 'inline-flex', alignItems: 'center', background: solid ? '#17150f' : '#ffffff', color: solid ? '#ffffff' : '#17150f', padding: '10px 20px', borderRadius: 30, fontWeight: 600, textDecoration: 'none', transition: 'background 0.4s ease, color 0.4s ease' }}>
              {shop.label}
            </a>
          )}
          <a href={cta.href} className={shop ? 'iho-btn iho-btn-pair' : 'iho-btn'} onClick={close} style={{ display: 'inline-flex', alignItems: 'center', background: '#ef483d', color: '#fff', padding: '10px 20px', borderRadius: 30, fontWeight: 600, textDecoration: 'none' }}>
            {cta.label}
          </a>
          {tools && <div className="iho-header-tools" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>{tools}</div>}
        </nav>
        <button id="iho-menu-btn" className={menuOpen ? 'is-open' : ''} aria-label={t('menu')} aria-expanded={menuOpen} onClick={() => setMenuOpen(o => !o)}>
          <span /><span /><span />
        </button>
      </div>
    </header>
  )
}
