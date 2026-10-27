import { geoMercator } from 'd3-geo'

export const MAP_WIDTH = 980
export const MAP_HEIGHT = 640
const PAD = 8

const BBOX = {
  type: 'Polygon' as const,
  coordinates: [[[-118.5, 33.4], [-59, 33.4], [-59, 1], [-118.5, 1], [-118.5, 33.4]]],
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
  'caracas': [-66.9, 10.48],
}

export function projectPoint(longitude: number, latitude: number): [number, number] | null {
  return latamProjection()([longitude, latitude]) ?? null
}

export function projectCity(name: string, point?: { longitude: number | null; latitude: number | null }): [number, number] | null {
  if (point?.longitude != null && point.latitude != null) return projectPoint(point.longitude, point.latitude)
  const coords = CITY_COORDS[name.trim().toLowerCase()]
  if (!coords) return null
  return projectPoint(coords[0], coords[1])
}
