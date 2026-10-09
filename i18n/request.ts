import { getRequestConfig } from 'next-intl/server'

const LOCALES = ['es', 'en'] as const
type AppLocale = (typeof LOCALES)[number]

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale: AppLocale = LOCALES.includes(requested as AppLocale) ? (requested as AppLocale) : 'es'
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
