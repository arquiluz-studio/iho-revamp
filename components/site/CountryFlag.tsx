import type { CountryCode } from '@/config/countries'

/** Flag at the same height as the ISO capitals (`1cap` on `.iho-country-flag`). */
export function CountryFlag({ code }: { code: CountryCode }) {
  const props = { className: 'iho-country-flag', 'aria-hidden': true as const, focusable: false as const }
  switch (code) {
    case 'mx':
      return (
        <svg {...props} viewBox="0 0 21 12">
          <rect width="7" height="12" fill="#006847" />
          <rect x="7" width="7" height="12" fill="#fff" />
          <rect x="14" width="7" height="12" fill="#ce1126" />
        </svg>
      )
    case 'gt':
      return (
        <svg {...props} viewBox="0 0 24 15">
          <rect width="8" height="15" fill="#4997d0" />
          <rect x="8" width="8" height="15" fill="#fff" />
          <rect x="16" width="8" height="15" fill="#4997d0" />
        </svg>
      )
    case 'cr':
      return (
        <svg {...props} viewBox="0 0 30 18">
          <rect width="30" height="3" fill="#002b7f" />
          <rect y="3" width="30" height="3" fill="#fff" />
          <rect y="6" width="30" height="6" fill="#ce1126" />
          <rect y="12" width="30" height="3" fill="#fff" />
          <rect y="15" width="30" height="3" fill="#002b7f" />
        </svg>
      )
    case 'pa':
      return (
        <svg {...props} viewBox="0 0 30 20">
          <rect width="15" height="10" fill="#fff" />
          <rect x="15" width="15" height="10" fill="#da121a" />
          <rect y="10" width="15" height="10" fill="#005293" />
          <rect x="15" y="10" width="15" height="10" fill="#fff" />
          <polygon fill="#005293" points="7.50,2.85 8.01,4.30 9.54,4.34 8.32,5.27 8.76,6.74 7.50,5.86 6.24,6.74 6.68,5.27 5.46,4.34 6.99,4.30" />
          <polygon fill="#da121a" points="22.50,12.85 23.01,14.30 24.54,14.34 23.32,15.27 23.76,16.74 22.50,15.86 21.24,16.74 21.68,15.27 20.46,14.34 21.99,14.30" />
        </svg>
      )
  }
}
