const SHORT: Record<string, string> = {
  'ciudad de méxico': 'CDMX',
  cdmx: 'CDMX',
  guadalajara: 'GDL',
  monterrey: 'MTY',
  'ciudad juárez': 'CJS',
  'cd. juárez': 'CJS',
  tijuana: 'TIJ',
  chihuahua: 'CUU',
}

const DISPLAY: Record<string, string> = { 'ciudad de méxico': 'CDMX', cdmx: 'CDMX' }

const SMALL_WORDS = new Set(['de', 'del', 'la', 'el', 'y'])

function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split(' ')
    .map((w, i) => (i > 0 && SMALL_WORDS.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')
}

/** Timeline chip label: 'GDL', 'MTY', 'CDMX'; unknown cities fall back to the uppercased name. */
export function cityChip(city: string): string {
  const key = city.trim().toLowerCase()
  return SHORT[key] ?? city.trim().toUpperCase()
}

/** Map legend label: 'CDMX', 'Cd. Juárez', 'Guadalajara'. */
export function cityDisplay(city: string): string {
  const key = city.trim().toLowerCase()
  return DISPLAY[key] ?? titleCase(city.trim())
}
