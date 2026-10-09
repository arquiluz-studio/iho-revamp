import { CONTEXT_PATH, COUNTRY_PATHS } from '@/lib/geo/latam-map-data'
import { MAP_HEIGHT, MAP_WIDTH, projectCity } from '@/lib/geo/latam-projection'
import type { MapCountryVM } from '@/lib/types/site'

const LAND = '#a2a2a2'
const LAND_CURRENT = '#8c8c8c'
const CONTEXT = '#dcdcdc'

export function GroupMap({ countries, title }: { countries: MapCountryVM[]; title: string }) {
  const current = new Set(countries.filter(c => c.isCurrent).map(c => c.code))
  const pins = countries.flatMap(c => (c.cities.length ? c.cities : [c.name]).map(city => ({ key: `${c.code}-${city}`, xy: projectCity(city) })))

  return (
    <div id="iho-map-frame" style={{ width: '100%', height: 560, display: 'block', background: '#ffffff', overflow: 'hidden' }}>
      <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} role="img" aria-label={title} preserveAspectRatio="xMidYMid meet" style={{ display: 'block', width: '100%', height: '100%' }}>
        <defs>
          <filter id="iho-pin-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000" floodOpacity="0.28" />
          </filter>
        </defs>
        <path d={CONTEXT_PATH} fill={CONTEXT} />
        <g stroke="#ffffff" strokeWidth={0.8} strokeLinejoin="round">
          {Object.entries(COUNTRY_PATHS).map(([code, d]) => (
            <path key={code} d={d} fill={current.has(code) ? LAND_CURRENT : LAND} />
          ))}
        </g>
        <g filter="url(#iho-pin-shadow)">
          {pins.map(p => p.xy && <circle key={p.key} cx={p.xy[0]} cy={p.xy[1]} r={11} fill="#ffffff" />)}
        </g>
      </svg>
    </div>
  )
}
