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

  return (
    <div id="iho-stats" className="iho-stats-row" ref={ref}>
      {stats.map((s, i) => (
        <div key={i}>
          <div className="iho-counter" style={{ fontFamily: ACUMIN, fontWeight: 800, letterSpacing: '-1px' }}>{format(s, s.value)}</div>
          <div className="iho-stats-row__label">{s.label}</div>
        </div>
      ))}
    </div>
  )
}
