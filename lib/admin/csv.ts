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
