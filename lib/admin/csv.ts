type Cell = string | number | boolean | null | undefined

function escape(value: Cell): string {
  if (value === null || value === undefined) return ''
  const text = String(value)
  // Prevent spreadsheet formula injection from user-submitted fields.
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text
  return /[",\n\r;]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

export function toCsv(header: string[], rows: Cell[][]): string {
  return [header, ...rows].map(row => row.map(escape).join(',')).join('\r\n')
}

/**
 * Parses an uploaded CSV into objects keyed by lower-cased header. Accepts `,` or `;` (Excel in Spanish
 * locales exports `;`), quoted cells and a UTF-8 BOM.
 */
export function parseCsv(text: string): Record<string, string>[] {
  const source = text.replace(/^\uFEFF/, '')
  const firstLine = source.split(/\r?\n/, 1)[0] ?? ''
  const delimiter = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ';' : ','
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < source.length; i++) {
    const char = source[i]
    if (quoted) {
      if (char === '"' && source[i + 1] === '"') {
        cell += '"'
        i++
      } else if (char === '"') quoted = false
      else cell += char
    } else if (char === '"') quoted = true
    else if (char === delimiter) {
      row.push(cell)
      cell = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && source[i + 1] === '\n') i++
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else cell += char
  }
  if (cell || row.length) rows.push([...row, cell])
  const [header, ...body] = rows.filter(r => r.some(c => c.trim()))
  if (!header) return []
  const keys = header.map(h => h.trim().toLowerCase())
  return body.map(r => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? '').trim()])))
}

/** CSV download response; the BOM makes Excel open UTF-8 accents correctly. */
export function csvResponse(filename: string, csv: string): Response {
  return new Response(`\uFEFF${csv}`, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="${filename}"`,
      'cache-control': 'no-store',
    },
  })
}
