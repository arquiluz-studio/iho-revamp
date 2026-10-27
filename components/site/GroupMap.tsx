'use client'

import { useState } from 'react'
import { CONTEXT_PATH, COUNTRY_PATHS } from '@/lib/geo/latam-map-data'
import { MAP_HEIGHT, MAP_WIDTH } from '@/lib/geo/latam-projection'
import type { MapCountryVM } from '@/lib/types/site'

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
  const [active, setActive] = useState<string | null>(null)
  const selectedCountry = countries.find(country => country.cities.some(city => city.id === active))?.code
  const pins = countries.flatMap(country => country.cities.filter(city => city.x != null && city.y != null))

  return (
    <div className="iho-presence">
      <div className="iho-presence__list">
        <h3>{placesLabel}</h3>
        {countries.map(country => (
          <div key={country.code} className="iho-presence__block">
            <p className="iho-presence__country">{country.name}</p>
            <ul>
              {country.cities.map(city => (
                <li
                  key={city.id}
                  onMouseEnter={() => setActive(city.id)}
                  onMouseLeave={() => setActive(currentId => (currentId === city.id ? null : currentId))}
                >
                  <button type="button" className={active === city.id ? 'iho-presence__city is-active' : 'iho-presence__city'} aria-expanded={active === city.id} onFocus={() => setActive(city.id)} onBlur={() => setActive(null)}>
                    {city.name}
                  </button>
                  {active === city.id &&
                    (city.mapsUrl ? (
                      <a className="iho-presence__address" href={city.mapsUrl} target="_blank" rel="noopener noreferrer">
                        {city.address}
                      </a>
                    ) : (
                      <p className="iho-presence__address">{city.address}</p>
                    ))}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="iho-presence__map">
        <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} role="img" aria-label={title} preserveAspectRatio="xMidYMid meet">
          <path d={CONTEXT_PATH} fill={CONTEXT} />
          <g stroke="#ffffff" strokeWidth={0.8} strokeLinejoin="round">
            {Object.entries(COUNTRY_PATHS).map(([code, d]) => (
              <path key={code} d={d} fill={code === selectedCountry ? LAND_CURRENT : LAND} />
            ))}
          </g>
          {pins.map(city => (
            <circle
              key={city.id}
              cx={city.x ?? 0}
              cy={city.y ?? 0}
              r={active === city.id ? 7 : 4.5}
              fill="#ef483d"
              onMouseEnter={() => setActive(city.id)}
              onMouseLeave={() => setActive(currentId => (currentId === city.id ? null : currentId))}
            >
              <title>{city.name}</title>
            </circle>
          ))}
        </svg>
        <p className="iho-presence__caption">
          <span>{eyebrow}</span>
          <strong>{caption}</strong>
        </p>
      </div>
    </div>
  )
}
