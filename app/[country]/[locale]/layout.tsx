import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { preload } from 'react-dom'
import { GeoBanner } from '@/components/site/GeoBanner'
import { COUNTRIES, COUNTRY_CODES, countryOrigin, htmlLang } from '@/config/countries'
import { resolveSiteParams, siteStaticParams, type SiteParams } from '@/lib/site-params'
import '../../globals.css'

export function generateStaticParams() {
  return siteStaticParams()
}

export async function generateMetadata({ params }: { params: Promise<SiteParams> }): Promise<Metadata> {
  const { country, locale } = await resolveSiteParams(params)
  const t = await getTranslations({ locale, namespace: 'meta' })
  const name = COUNTRIES[country].name[locale]
  return {
    metadataBase: new URL(countryOrigin(country)),
    title: { default: t('title', { country: name }), template: `%s · ${name}` },
    description: t('description', { country: name }),
  }
}

export default async function SiteLayout({ children, params }: { children: React.ReactNode; params: Promise<SiteParams> }) {
  const { country, locale } = await resolveSiteParams(params)
  preload('/fonts/119f296f.woff2', { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' })
  return (
    <html lang={htmlLang(locale, country)}>
      <body>
        <NextIntlClientProvider>
          {children}
          <GeoBanner current={country} countries={[...COUNTRY_CODES]} />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
