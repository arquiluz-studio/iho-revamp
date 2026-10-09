import { geoMercator } from 'd3-geo'

export const MAP_WIDTH = 920
export const MAP_HEIGHT = 1110
const PAD = 8

const BBOX = {
  type: 'Polygon' as const,
  coordinates: [[[-119, 42], [-72, 42], [-72, -9], [-119, -9], [-119, 42]]],
}

export function latamProjection() {
  return geoMercator()
    .fitExtent([[PAD, PAD], [MAP_WIDTH - PAD, MAP_HEIGHT - PAD]], BBOX)
    .clipExtent([[0, 0], [MAP_WIDTH, MAP_HEIGHT]])
}

/** Coordinates for cities where IHO has offices (lon, lat). */
export const CITY_COORDS: Record<string, [number, number]> = {
  'tijuana': [-117.04, 32.53],
  'cd. juárez': [-106.49, 31.69],
  'ciudad juárez': [-106.49, 31.69],
  'chihuahua': [-106.07, 28.63],
  'monterrey': [-100.31, 25.69],
  'guadalajara': [-103.35, 20.66],
  'cdmx': [-99.13, 19.43],
  'ciudad de méxico': [-99.13, 19.43],
  'guatemala': [-90.51, 14.63],
  'ciudad de guatemala': [-90.51, 14.63],
  'costa rica': [-84.09, 9.93],
  'san josé': [-84.09, 9.93],
  'panamá': [-79.52, 8.98],
  'ciudad de panamá': [-79.52, 8.98],
}

export function projectCity(name: string): [number, number] | null {
  const coords = CITY_COORDS[name.trim().toLowerCase()]
  if (!coords) return null
  return latamProjection()(coords) ?? null
}
