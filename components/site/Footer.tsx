import { useTranslations } from 'next-intl'
import type { NavLink } from '@/lib/types/site'

type Social = { platform: string; url: string; label: string }

export function Footer({ homeHref, contactHref, privacyHref = '#', socials = [] }: {
  homeHref: string
  contactHref: string
  privacyHref?: string
  socials?: Social[]
}) {
  const t = useTranslations('footer')
  const links: NavLink[] = [
    { href: privacyHref, label: t('privacy') },
    { href: contactHref, label: t('contact') },
  ]
  return (
    <footer style={{ background: '#1a1916', color: '#c9c4ba' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '30px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <a href={homeHref}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-iho-white.png" alt="IHO" style={{ height: 30, display: 'block' }} />
        </a>
        <div style={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: 13, color: '#8a857b' }}>{t('rights', { year: new Date().getFullYear() })}</div>
        <div style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap', fontFamily: '"Source Sans 3", sans-serif', fontSize: 13 }}>
          {socials.map(s => (
            <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: '#c9c4ba' }}>{s.label}</a>
          ))}
          {links.map(l => <a key={l.label} href={l.href} style={{ color: '#c9c4ba' }}>{l.label}</a>)}
        </div>
      </div>
    </footer>
  )
}
