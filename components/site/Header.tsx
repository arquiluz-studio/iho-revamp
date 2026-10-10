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
  /** Secondary button next to the CTA, to the group's online store. */
  shop?: NavLink
  /** Fraction of the viewport height after which the header turns solid. */
  threshold?: number
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

function HeaderBar({ logoHref, links, cta, shop, threshold = 0.75, tools }: Props) {
  const t = useTranslations('common')
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const subnav = useSubnav()
  // Read from the browser: on the server the pathname is the internal rewritten route, not the visible URL.
  const pathname = useSyncExternalStore(noopSubscribe, () => window.location.pathname, () => null)
  const matches = (href: string) => pathname !== null && (pathname === href || pathname.startsWith(`${href}/`))
  const isActive = (link: NavLink) => matches(link.href)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * threshold)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  const navColor = menuOpen || scrolled ? '#2c2920' : '#ffffff'
  const close = () => setMenuOpen(false)

  return (
    <header data-solid={scrolled ? 'true' : 'false'} style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60, background: scrolled ? '#faf7f1' : 'transparent', borderBottom: `1px solid ${scrolled ? 'rgba(20,18,12,0.08)' : 'rgba(255,255,255,0.14)'}`, transition: 'background 0.4s ease, border-color 0.4s ease' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '18px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href={logoHref}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={scrolled ? '/images/logo-iho-black.png' : '/images/logo-iho-white.png'} alt="IHO" style={{ height: 36, display: 'block' }} />
        </a>
        <nav className={menuOpen ? 'iho-nav-open' : ''} style={{ display: 'flex', alignItems: 'center', gap: 34, fontFamily: '"Source Sans 3", sans-serif', fontSize: 15, fontWeight: 500, color: navColor }}>
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
                    items={[
                      ...l.items.map(item => ({ href: item.href, label: item.label, current: matches(item.href) })),
                      ...(l.allLabel ? [{ href: l.href, label: l.allLabel, current: pathname === l.href }] : []),
                    ]}
                  />
                )}
              </div>
            )
          })}
          {shop && (
            <a href={shop.href} className="iho-nav-link" aria-current={isActive(shop) ? 'page' : undefined} onClick={close} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <svg aria-hidden="true" width={10} height={10} viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="square" style={{ display: 'block', flex: 'none' }}>
                <path d="M1.5 8.5 8 2M3 1.5h5.5V7" />
              </svg>
              {shop.label}
            </a>
          )}
          <a href={cta.href} className="iho-btn" onClick={close} style={{ display: 'inline-flex', alignItems: 'center', background: '#ef483d', color: '#fff', padding: '10px 20px', borderRadius: 30, fontWeight: 600, textDecoration: 'none' }}>
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
