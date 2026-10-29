import type { CountryCode } from '@/config/countries'

/** Eagle, nopal and wreath, scaled to the white stripe of the 84×48 flag. */
function MexicoCoat() {
  return (
    <g transform="translate(30 8)">
      <ellipse cx="12" cy="18" rx="11" ry="13" fill="#1b6b34" />
      <ellipse cx="12" cy="17.2" rx="8" ry="9.6" fill="#fff" />
      <rect width="24" height="8.5" fill="#fff" />
      <ellipse cx="3.2" cy="15" rx="2.1" ry="1.15" fill="#145528" transform="rotate(-55 3.2 15)" />
      <ellipse cx="2.4" cy="20.5" rx="2.2" ry="1.15" fill="#2d8a46" transform="rotate(-75 2.4 20.5)" />
      <ellipse cx="4.2" cy="25.5" rx="2.1" ry="1.1" fill="#145528" transform="rotate(-100 4.2 25.5)" />
      <ellipse cx="8" cy="29" rx="2.2" ry="1.1" fill="#2d8a46" transform="rotate(-130 8 29)" />
      <ellipse cx="20.8" cy="14.2" rx="2.1" ry="1.15" fill="#2d8a46" transform="rotate(50 20.8 14.2)" />
      <ellipse cx="21.6" cy="19.8" rx="2.2" ry="1.15" fill="#145528" transform="rotate(72 21.6 19.8)" />
      <ellipse cx="19.8" cy="25" rx="2.1" ry="1.1" fill="#2d8a46" transform="rotate(100 19.8 25)" />
      <ellipse cx="16" cy="28.8" rx="2.2" ry="1.1" fill="#145528" transform="rotate(130 16 28.8)" />
      <ellipse cx="12" cy="28.2" rx="6.2" ry="2.3" fill="#8d6b52" />
      <ellipse cx="12" cy="27.4" rx="3.4" ry="1.1" fill="#6d5340" />
      <path fill="#0d7a3a" d="M10.2 16.8h3.6c.9 0 1.5.7 1.5 1.6v8.2c0 1.3-1.4 2.2-3.3 2.2s-3.3-.9-3.3-2.2v-8.2c0-.9.6-1.6 1.5-1.6z" />
      <path fill="#0d7a3a" d="M10.4 21.2C7.2 20.6 4.2 18.2 3.4 14.6c-.3-1.5.8-2.6 2-1.8 1.2 1 2.8 3.2 4.2 5.2.4.6.8 1.8.8 3.2z" />
      <path fill="#0d7a3a" d="M13.4 19.4c3.2-.8 6.4-3.2 7.4-6.6.4-1.5-.8-2.5-2-1.6-1.3 1.1-3 3.4-4.4 5.2-.5.7-1 2-1 3z" />
      <circle cx="3.6" cy="13.2" r="1.25" fill="#d0122a" />
      <circle cx="20.2" cy="11.4" r="1.25" fill="#d0122a" />
      <circle cx="12" cy="16.2" r="1.05" fill="#d0122a" />
      <path fill="#5c3212" d="M10.2 11.2C13.6 5.6 19.2 3.6 22.6 7.2c-.8.6-2.6.2-3.4 2.2 1.6.6 3.2 2.6 1.8 4.2-2.2-.6-4.4-.2-6.2 1.2-1.2-1.2-3.2-1.6-4.6-3.6z" />
      <ellipse cx="11.2" cy="15.2" rx="4.3" ry="5" fill="#6b3a16" />
      <circle cx="7.4" cy="11.6" r="2.7" fill="#6b3a16" />
      <path fill="#4a2810" d="M13.2 17.6 18.4 24.2 15.2 22.4 14.2 26.2 12.2 21.6 9.2 24.4 11 17.8z" />
      <path fill="#e2b33a" d="M5.2 10.8 1.4 12.8 5.4 14.2z" />
      <path fill="#4e6228" d="M2.2 12.6C.2 11.2-.2 16 3.2 17.4 6.2 18.6 5.6 22.6 2.6 21.6 4.8 22.4 7.4 19.4 5.2 17.2 2.8 16.2 1.8 13.6 3.4 13z" />
      <path fill="#e2b33a" d="M9.6 19.2 10.2 22.4 11.4 19.4zM12.2 19.4 13.2 22.8 14 19.2z" />
      <path fill="#006847" d="M7.2 27.6h3.2l.4 3.6H7.4z" />
      <path fill="#fff" d="M10.4 27.6h3.2v3.6h-3.2z" />
      <path fill="#ce1126" d="M13.6 27.6h3.2l-.4 3.6h-3.2z" />
    </g>
  )
}

/** Flag at the same height as the ISO capitals (`1cap` on `.iho-country-flag`). */
export function CountryFlag({ code }: { code: CountryCode }) {
  const props = { className: 'iho-country-flag', 'aria-hidden': true as const, focusable: false as const }
  switch (code) {
    case 'mx':
      return (
        <svg {...props} viewBox="0 0 84 48">
          <rect width="28" height="48" fill="#006847" />
          <rect x="28" width="28" height="48" fill="#fff" />
          <rect x="56" width="28" height="48" fill="#ce1126" />
          <MexicoCoat />
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
