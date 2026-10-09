'use client'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ButtonArrow } from '@/components/ui/Arrow'
import type { NavLink } from '@/lib/types/site'

type Props = {
  logoHref: string
  links: NavLink[]
  cta: NavLink
  /** Fraction of the viewport height after which the header turns solid. */
  threshold?: number
  /** Extra controls (country / language switchers). */
  tools?: React.ReactNode
}

export function Header({ logoHref, links, cta, threshold = 0.75, tools }: Props) {
  const t = useTranslations('common')
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * threshold)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  const navColor = menuOpen || scrolled ? '#2c2920' : '#ffffff'
  const close = () => setMenuOpen(false)

  return (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60, background: scrolled ? '#faf7f1' : 'transparent', borderBottom: `1px solid ${scrolled ? 'rgba(20,18,12,0.08)' : 'rgba(255,255,255,0.14)'}`, transition: 'background 0.4s ease, border-color 0.4s ease' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '18px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href={logoHref}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={scrolled ? '/images/logo-iho-black.png' : '/images/logo-iho-white.png'} alt="IHO" style={{ height: 36, display: 'block' }} />
        </a>
        <nav className={menuOpen ? 'iho-nav-open' : ''} style={{ display: 'flex', alignItems: 'center', gap: 34, fontFamily: '"Source Sans 3", sans-serif', fontSize: 15, fontWeight: 500, color: navColor }}>
          {links.map(l => (
            <a key={l.href} href={l.href} className="iho-nav-link" onClick={close}>{l.label}</a>
          ))}
          {tools && <div className="iho-header-tools" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>{tools}</div>}
          <a href={cta.href} className="iho-btn" onClick={close} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#ef483d', color: '#fff', padding: '10px 20px', borderRadius: 30, fontWeight: 600, textDecoration: 'none' }}>
            {cta.label}
            <ButtonArrow w={15} h={13} />
          </a>
        </nav>
        <button id="iho-menu-btn" className={menuOpen ? 'is-open' : ''} aria-label={t('menu')} aria-expanded={menuOpen} onClick={() => setMenuOpen(o => !o)}>
          <span /><span /><span />
        </button>
      </div>
    </header>
  )
}
