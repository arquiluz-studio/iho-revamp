import 'server-only'
import { getTranslations } from 'next-intl/server'
import type { AppLocale, CountryCode } from '@/config/countries'
import type { SitePaths } from '@/lib/content/paths'
import { getSocialAccounts } from '@/lib/queries/site'
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

/** Chrome for listing and detail pages (events, projects, brands, areas, spaces, contact, privacy). */
export async function innerChrome(country: CountryCode, locale: AppLocale, paths: SitePaths, localeHrefs?: LocaleHrefs): Promise<SiteChrome> {
  const tn = await getTranslations({ locale, namespace: 'nav' })
  return siteChrome({
    country,
    locale,
    paths,
    threshold: 0.3,
    links: [
      { href: paths.events, label: tn('events') },
      { href: paths.projects, label: tn('projects') },
      { href: paths.brands, label: tn('brands') },
      { href: paths.homeSection('grupo'), label: tn('group') },
    ],
    cta: { href: paths.contact, label: tn('contact') },
    contactHref: paths.contact,
    localeHrefs,
  })
}

/** Header + footer shared by every public page; footer social links come from the country's `social_accounts`. */
export async function siteChrome({ country, paths, links, cta, threshold, contactHref, localeHrefs }: {
  country: CountryCode
  locale: AppLocale
  paths: SitePaths
  links: NavLink[]
  cta: NavLink
  threshold?: number
  contactHref?: string
  /** Language switcher targets when the page slug differs per locale. */
  localeHrefs?: LocaleHrefs
}): Promise<SiteChrome> {
  const socials = await getSocialAccounts(country)
  return {
    header: <Header logoHref={paths.home} threshold={threshold} links={links} cta={cta} tools={<SiteTools country={country} localeHrefs={localeHrefs} />} />,
    footer: (
      <Footer
        homeHref={paths.home}
        contactHref={contactHref ?? paths.homeSection('contacto')}
        privacyHref={paths.privacy}
        socials={socials.map(s => ({ platform: s.platform, url: s.url, label: PLATFORM_LABELS[s.platform] ?? s.platform }))}
        tools={<SiteTools country={country} placement="footer" localeHrefs={localeHrefs} />}
      />
    ),
  }
}
