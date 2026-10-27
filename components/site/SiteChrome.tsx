import 'server-only'
import { getTranslations } from 'next-intl/server'
import type { AppLocale, CountryCode } from '@/config/countries'
import type { SitePaths } from '@/lib/content/paths'
import { localSlug, t } from '@/lib/i18n-fields'
import { getBusinessLines, getSectors, getSocialAccounts } from '@/lib/queries/site'
import type { NavLink } from '@/lib/types/site'
import { Footer } from './Footer'
import { Header } from './Header'
import type { SiteChrome } from './HomeView'
import { SiteTools, type LocaleHrefs } from './SiteTools'

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  x: 'X',
  pinterest: 'Pinterest',
  whatsapp: 'WhatsApp',
}

/** Chrome for every public page except the home hero, which keeps a taller transparent header. */
export async function innerChrome(country: CountryCode, locale: AppLocale, paths: SitePaths, localeHrefs?: LocaleHrefs): Promise<SiteChrome> {
  return siteChrome({
    country,
    locale,
    paths,
    threshold: 0.3,
    contactHref: paths.contact,
    localeHrefs,
  })
}

/** Header + footer shared by every public page. The nav is the same on every page. */
export async function siteChrome({ country, locale, paths, threshold, contactHref, localeHrefs }: {
  country: CountryCode
  locale: AppLocale
  paths: SitePaths
  threshold?: number
  contactHref?: string
  /** Language switcher targets when the page slug differs per locale. */
  localeHrefs?: LocaleHrefs
}): Promise<SiteChrome> {
  const [socials, tn, lines, sectors] = await Promise.all([
    getSocialAccounts(country),
    getTranslations({ locale, namespace: 'nav' }),
    getBusinessLines(),
    getSectors(),
  ])
  const links: NavLink[] = [
    { href: paths.group, label: tn('group') },
    {
      href: paths.solutions,
      label: tn('solutions'),
      items: lines.map(line => ({ href: paths.solution(localSlug(line, locale)), label: t(line, 'name', locale) })),
    },
    {
      href: paths.spaces,
      label: tn('spaces'),
      items: sectors.map(sector => ({ href: paths.space(localSlug(sector, locale)), label: t(sector, 'name', locale) })),
    },
    {
      href: paths.products,
      label: tn('products'),
      items: [
        { href: paths.brands, label: tn('brands') },
        { href: paths.designers, label: tn('designers') },
        { href: paths.products, label: tn('shop'), arrow: true },
      ],
    },
    { href: paths.projects, label: tn('projects') },
    { href: paths.events, label: tn('events') },
  ]
  const cta: NavLink = { href: paths.contact, label: tn('contact') }
  return {
    header: <Header logoHref={paths.home} threshold={threshold} links={links} cta={cta} tools={<SiteTools country={country} localeHrefs={localeHrefs} />} />,
    footer: (
      <Footer
        homeHref={paths.home}
        contactHref={contactHref ?? paths.homeSection('contacto')}
        privacyHref={paths.privacy}
        socials={socials.map(s => ({ platform: s.platform, url: s.url, label: PLATFORM_LABELS[s.platform] ?? s.platform }))}
      />
    ),
  }
}
