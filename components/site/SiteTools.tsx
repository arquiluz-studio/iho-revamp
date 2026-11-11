import { COUNTRY_CODES, type AppLocale, type CountryCode } from '@/config/countries'
import { CountrySwitcher } from './CountrySwitcher'

export type LocaleHrefs = Partial<Record<AppLocale, string>>

export function SiteTools({ country, localeHrefs }: { country: CountryCode; localeHrefs?: LocaleHrefs }) {
  return <CountrySwitcher current={country} countries={[...COUNTRY_CODES]} localeHrefs={localeHrefs} />
}
