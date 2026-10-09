export function SectorStrip({ items }: { items: string[] }) {
  return (
    <div style={{ borderTop: '1px solid rgba(20,18,12,0.1)', borderBottom: '1px solid rgba(20,18,12,0.1)' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '18px 40px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, fontFamily: '"Space Mono", monospace', fontSize: 12, letterSpacing: '1.5px', color: '#8a8478', backgroundColor: '#ffffff' }}>
        {items.map(s => <span key={s}>{s}</span>)}
      </div>
    </div>
  )
}
