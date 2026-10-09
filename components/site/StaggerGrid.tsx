'use client'
import { useEffect, useRef } from 'react'

/** Grid whose direct children fade in one after another when it enters the viewport. */
export function StaggerGrid({ id, delay, style, children }: { id: string; delay: number; style: React.CSSProperties; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const grid = ref.current
    if (!grid) return
    let seen = false
    const cards = Array.from(grid.children)
    const obs = new IntersectionObserver(e => {
      if (seen || !e[0].isIntersecting) return
      seen = true
      obs.disconnect()
      cards.forEach((c, i) => setTimeout(() => c.classList.add('is-visible'), i * delay))
    }, { threshold: 0.08 })
    obs.observe(grid)
    return () => obs.disconnect()
  }, [delay])

  return <div id={id} ref={ref} style={style}>{children}</div>
}
