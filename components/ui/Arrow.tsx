const ARROW_PATH = 'M14.9922 0.907227C15.5854 0.343852 16.5108 0.355639 17.1152 1.00195L17.124 1.01074L17.1318 1.02051L25.1328 10.4727L25.1484 10.4922L25.1631 10.5127C25.3539 10.7913 25.4917 11.1077 25.5 11.4648C25.5084 11.8252 25.3839 12.1656 25.1641 12.4883L25.1494 12.5098L25.1328 12.5293L17.1318 21.9814L17.1289 21.9854C16.64 22.5526 15.7236 22.6944 15.1006 22.1924L14.9805 22.084C14.6941 21.7942 14.5482 21.4033 14.5283 21.0264C14.5084 20.6492 14.6124 20.2394 14.8867 19.9209L20.7031 13.0518H2C1.14833 13.0517 0.5 12.3342 0.5 11.501C0.500069 10.6678 1.14836 9.95119 2 9.95117H20.7031L14.8867 3.08008V3.08105C14.614 2.76423 14.5066 2.35345 14.5244 1.97461C14.5423 1.59564 14.6884 1.1958 14.9922 0.907227Z'

export function Arrow({ w = 17, h = 15, flip = false }: { w?: number; h?: number; flip?: boolean }) {
  return (
    <svg viewBox="0 0 26 23" width={w} height={h} fill="currentColor" style={{ display: 'block', flex: 'none', transform: flip ? 'scaleX(-1)' : undefined }}>
      <path d={ARROW_PATH} />
    </svg>
  )
}

export function ButtonArrow({ w, h }: { w?: number; h?: number }) {
  return (
    <span className="iho-arrow" style={{ display: 'inline-flex', alignItems: 'center' }}>
      <Arrow w={w} h={h} />
    </span>
  )
}
