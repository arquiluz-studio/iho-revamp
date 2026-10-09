import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { GeoBanner } from '@/components/site/GeoBanner'
import { COUNTRY_CODES, countryOrigin, htmlLang } from '@/config/countries'
import { resolveSiteParams, siteStaticParams, type SiteParams } from '@/lib/site-params'
import '../../globals.css'

export const dynamicParams = false

export function generateStaticParams() {
  return siteStaticParams()
}

export async function generateMetadata({ params }: { params: Promise<SiteParams> }): Promise<Metadata> {
  const { country, locale } = await resolveSiteParams(params)
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    metadataBase: new URL(countryOrigin(country)),
    title: t('title'),
    description: t('description'),
  }
}

export default async function SiteLayout({ children, params }: { children: React.ReactNode; params: Promise<SiteParams> }) {
  const { country, locale } = await resolveSiteParams(params)
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
