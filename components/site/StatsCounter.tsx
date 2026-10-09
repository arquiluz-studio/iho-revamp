'use client'
import { useEffect, useRef } from 'react'
import { ACUMIN } from '@/components/ui/tokens'
import type { StatVM } from '@/lib/types/site'

const format = (s: StatVM, n: number) => `${s.prefix}${n}${s.suffix}`

export function StatsCounter({ stats }: { stats: StatVM[] }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let done = false
    const run = () => {
      if (done) return
      done = true
      el.querySelectorAll('.iho-counter').forEach((counter, idx) => {
        const s = stats[idx]
        if (!s) return
        const t0 = performance.now()
        const tick = (now: number) => {
          const t = Math.min((now - t0) / 1800, 1)
          counter.textContent = format(s, Math.round((1 - Math.pow(1 - t, 3)) * s.value))
          if (t < 1) requestAnimationFrame(tick)
        }
        counter.textContent = format(s, 0)
        requestAnimationFrame(tick)
      })
    }
    const obs = new IntersectionObserver(e => { if (e[0].isIntersecting) run() }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [stats])

  const last = stats.length - 1
  return (
    <div id="iho-stats" ref={ref} style={{ display: 'flex', flexDirection: 'column' }}>
      {stats.map((s, i) => (
        <div key={i} style={{ padding: i === 0 ? '0 0 22px' : i === last ? '22px 0 0' : '22px 0', borderBottom: i < last ? '1px solid rgba(20,18,12,0.12)' : 'none' }}>
          <div className="iho-counter" style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: 52, lineHeight: 1, letterSpacing: '-1px' }}>{format(s, s.value)}</div>
          <div style={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: 13, color: '#8a8478', marginTop: 4, whiteSpace: 'pre-line' }}>{s.label}</div>
        </div>
      ))}
    </div>
  )
}
