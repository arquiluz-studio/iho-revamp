import { Fragment } from 'react'
import { ACUMIN, MONO } from './tokens'

export function SectionLabel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '1.5px', color: '#ef483d', marginBottom: 18, ...style }}>{children}</div>
}

/** Small centered title used by Projects and Team. */
export function SectionTitle({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <h2 style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: 50, lineHeight: 0.98, letterSpacing: '-0.5px', textTransform: 'uppercase', margin: '0 0 18px', ...style }}>{children}</h2>
}

/** Large left-aligned title used by most home sections. */
export function DisplayTitle({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <h2 style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: 54, lineHeight: 0.96, letterSpacing: '-0.5px', textTransform: 'uppercase', margin: 0, ...style }}>{children}</h2>
}

/**
 * Renders translated/DB text where `\n` is a line break and `*text*` is highlighted in brand red.
 */
export function RichText({ text, highlightColor = '#ef483d' }: { text: string; highlightColor?: string }) {
  const lines = text.split('\n')
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line.split(/(\*[^*]+\*)/g).filter(Boolean).map((part, j) =>
            part.startsWith('*') && part.endsWith('*')
              ? <span key={j} style={{ color: highlightColor }}>{part.slice(1, -1)}</span>
              : <Fragment key={j}>{part}</Fragment>,
          )}
        </Fragment>
      ))}
    </>
  )
}
