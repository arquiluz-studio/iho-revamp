'use client'

import { useState, type CSSProperties } from 'react'
import { CONTEXT_PATH, COUNTRY_PATHS } from '@/lib/geo/latam-map-data'
import { MAP_HEIGHT, MAP_WIDTH } from '@/lib/geo/latam-projection'
import type { MapCityVM, MapCountryVM } from '@/lib/types/site'

const LAND = '#c6c6c6'
const LAND_CURRENT = '#9a9a9a'
const CONTEXT = '#e4e4e4'

export function GroupMap({
  countries,
  title,
  placesLabel,
  eyebrow,
  caption,
}: {
  countries: MapCountryVM[]
  title: string
  placesLabel: string
  eyebrow: string
  caption: string
}) {
  const cities = countries.flatMap(country => country.cities)
  const [hover, setHover] = useState<string | null>(null)
  const activeCity = cities.find(city => city.id === hover) ?? null
  const selectedCountry = countries.find(country => country.cities.some(city => city.id === hover))?.code
  const pins = cities.filter(city => city.x != null && city.y != null)
  const showCard = activeCity != null && activeCity.x != null && activeCity.y != null

  return (
    <div className="iho-presence">
      <div className="iho-presence__list">
        <h3>{placesLabel}</h3>
        {countries.map(country => (
          <div key={country.code} className="iho-presence__block">
            <p className="iho-presence__country">{country.name}</p>
            <ul>
              {country.cities.map(city => (
                <li key={city.id}>
                  <button type="button" className={hover === city.id ? 'iho-presence__city is-active' : 'iho-presence__city'} onMouseEnter={() => setHover(city.id)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(city.id)} onBlur={() => setHover(null)}>
                    {city.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="iho-presence__map">
        <div className="iho-presence__canvas">
          <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} role="img" aria-label={title} preserveAspectRatio="xMidYMid meet">
            <path d={CONTEXT_PATH} fill={CONTEXT} />
            <g stroke="#ffffff" strokeWidth={0.8} strokeLinejoin="round">
              {Object.entries(COUNTRY_PATHS).map(([code, d]) => (
                <path key={code} d={d} fill={code === selectedCountry ? LAND_CURRENT : LAND} />
              ))}
            </g>
            {pins.map(city => (
              <MapPin key={city.id} city={city} active={hover === city.id} onEnter={() => setHover(city.id)} onLeave={() => setHover(null)} />
            ))}
          </svg>
          {showCard && activeCity && (
            <address
              className="iho-presence__card"
              style={{ '--pin-x': `${((activeCity.x ?? 0) / MAP_WIDTH) * 100}%`, '--pin-y': `${((activeCity.y ?? 0) / MAP_HEIGHT) * 100}%` } as CSSProperties}
            >
              <strong>{activeCity.title}</strong>
              {activeCity.mapsUrl ? (
                <a href={activeCity.mapsUrl} target="_blank" rel="noopener noreferrer">
                  {activeCity.address}
                </a>
              ) : (
                <span>{activeCity.address}</span>
              )}
            </address>
          )}
        </div>
        <p className="iho-presence__caption">
          <span>{eyebrow}</span>
          <strong>{caption}</strong>
        </p>
      </div>
    </div>
  )
}

function MapPin({ city, active, onEnter, onLeave }: { city: MapCityVM; active: boolean; onEnter: () => void; onLeave: () => void }) {
  return (
    <g transform={`translate(${city.x ?? 0} ${city.y ?? 0})`} style={{ cursor: 'pointer' }} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <title>{city.name}</title>
      {active && <circle r={11} fill="#ef483d" opacity={0.18} />}
      <circle r={active ? 5.5 : 4} fill="#ef483d" stroke="#ffffff" strokeWidth={active ? 2.2 : 1.4} />
    </g>
  )
}
