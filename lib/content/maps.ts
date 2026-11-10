const HTTP = /^https?:\/\//i

/** Google Maps link a phone can hand to its maps app. A saved URL wins; otherwise the address is searched. */
export function mapsHref(input: {
  url?: string | null
  latitude?: number | null
  longitude?: number | null
  venue?: string | null
  address?: string | null
  city?: string | null
}): string | null {
  const custom = input.url?.trim()
  if (custom && HTTP.test(custom)) return custom
  if (input.latitude != null && input.longitude != null && Number.isFinite(input.latitude) && Number.isFinite(input.longitude)) {
    return `https://www.google.com/maps/search/?api=1&query=${input.latitude},${input.longitude}`
  }
  const query = [input.venue, input.address, input.city].map(part => part?.trim()).filter(Boolean).join(', ')
  if (!query) return null
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}
