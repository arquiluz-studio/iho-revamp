import { COUNTRY_CODES, type CountryCode } from '@/config/countries'
import { CountrySwitcher } from './CountrySwitcher'
import { LocaleSwitcher } from './LocaleSwitcher'

export function SiteTools({ country, placement = 'header' }: { country: CountryCode; placement?: 'header' | 'footer' }) {
  return (
    <>
      <CountrySwitcher current={country} countries={[...COUNTRY_CODES]} placement={placement} />
      <LocaleSwitcher />
    </>
  )
}
