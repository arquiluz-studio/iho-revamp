import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { ContactSection } from '@/components/site/ContactSection'
import { PageHero, PageShell } from '@/components/site/pages/PageParts'
import { innerChrome } from '@/components/site/SiteChrome'
import { MONO, SANS } from '@/components/ui/tokens'
import { legacyMedia } from '@/lib/content/legacy-media'
import { sitePaths } from '@/lib/content/paths'
import { imageOf } from '@/lib/content/site'
import { getCountry, getCountrySettings, getOffices } from '@/lib/queries/site'
import { buildAlternates } from '@/lib/seo'
import { resolveSiteParams, type SiteParams } from '@/lib/site-params'

export async function generateMetadata({ params }: { params: Promise<SiteParams> }): Promise<Metadata> {
  const { country, locale } = await resolveSiteParams(params)
  const tc = await getTranslations({ locale, namespace: 'contact' })
  return { title: `${tc('title')} — IHO`, alternates: buildAlternates({ href: '/contact', country, locale }) }
}

export default async function ContactPage({ params }: { params: Promise<SiteParams> }) {
  const { country, locale } = await resolveSiteParams(params)
  const paths = sitePaths(locale)
  const [tc, tp, settings, offices, countryRow, chrome] = await Promise.all([
    getTranslations({ locale, namespace: 'contact' }),
    getTranslations({ locale, namespace: 'pages.contact' }),
    getCountrySettings(country),
    getOffices(),
    getCountry(country),
    innerChrome(country, locale, paths),
  ])
  const own = offices.filter(o => o.country_code === country)
  const channels = [
    countryRow?.phone && { label: tc('phone'), href: `tel:${countryRow.phone.replace(/\s/g, '')}`, value: countryRow.phone },
    countryRow?.whatsapp && { label: 'WhatsApp', href: `https://wa.me/${countryRow.whatsapp.replace(/\D/g, '')}`, value: countryRow.whatsapp },
    countryRow?.email && { label: tc('email'), href: `mailto:${countryRow.email}`, value: countryRow.email },
  ].filter(Boolean) as { label: string; href: string; value: string }[]

  return (
    <PageShell chrome={chrome}>
      <PageHero label={tp('label')} title={tc('title')}>
        {channels.length > 0 && (
          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', marginTop: 32 }}>
            {channels.map(c => (
              <a key={c.label} href={c.href} style={{ color: '#fff', textDecoration: 'none' }}>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '1.2px', color: 'rgba(255,255,255,0.6)', marginBottom: 6, textTransform: 'uppercase' }}>{c.label}</div>
                <div style={{ fontFamily: SANS, fontSize: 18 }}>{c.value}</div>
              </a>
            ))}
          </div>
        )}
      </PageHero>
      <ContactSection
        countryCode={country}
        offices={own.map(o => ({ city: o.city, address: o.address }))}
        image={imageOf(settings?.contact_image, locale, tc('imageAlt'), legacyMedia.contactImage(), 'md')}
      />
    </PageShell>
  )
}
