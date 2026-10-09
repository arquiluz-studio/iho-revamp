import { useTranslations } from 'next-intl'
import { MediaImage } from '@/components/ui/MediaImage'
import { RichText, SectionLabel, SectionTitle } from '@/components/ui/Section'
import { ACUMIN } from '@/components/ui/tokens'
import type { ProjectCardVM } from '@/lib/types/site'
import { StaggerGrid } from './StaggerGrid'

/** Bento layout for the six featured slots (4-column grid, 215px rows). */
const SLOTS = [
  { col: '1 / 3', row: '1 / 3', titleSize: 38, sizes: '(max-width: 768px) 100vw, 50vw' },
  { col: '3 / 5', row: '1 / 2', sizes: '(max-width: 768px) 100vw, 50vw' },
  { col: '3 / 5', row: '2 / 3', sizes: '(max-width: 768px) 100vw, 50vw' },
  { col: '1 / 2', row: '3 / 4', sizes: '(max-width: 768px) 100vw, 25vw' },
  { col: '2 / 4', row: '3 / 4', sizes: '(max-width: 768px) 100vw, 50vw' },
  { col: '4 / 5', row: '3 / 4', sizes: '(max-width: 768px) 100vw, 25vw' },
]

export function ProjectsGrid({ projects }: { projects: ProjectCardVM[] }) {
  const t = useTranslations('home.projects')
  if (projects.length === 0) return null
  return (
    <section id="proyectos" style={{ maxWidth: 1240, margin: '0 auto', padding: '88px 40px' }}>
      <div style={{ textAlign: 'center', marginBottom: 44 }}>
        <SectionLabel>{t('label')}</SectionLabel>
        <SectionTitle><RichText text={t('title')} /></SectionTitle>
        <p style={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: 15, lineHeight: 1.6, color: '#7a756a', maxWidth: 430, margin: '0 auto' }}>{t('intro')}</p>
      </div>
      <StaggerGrid id="iho-proj-grid" delay={100} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridAutoRows: 215, gap: 14 }}>
        {projects.slice(0, SLOTS.length).map((p, i) => {
          const slot = SLOTS[i]
          const card = (
            <div className="iho-proj-card" style={{ height: '100%' }}>
              <MediaImage image={p.image} sizes={slot.sizes} />
              <div className="pc-grad" />
              <div style={{ position: 'absolute', left: 24, right: 24, bottom: 22, pointerEvents: 'none' }}>
                <div className="pc-title" style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: slot.titleSize ?? 22, lineHeight: 1, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{p.title}</div>
                <div className="pc-desc" style={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: 13, lineHeight: 1.5, color: 'rgba(255,255,255,0.9)', maxWidth: 340 }}>{p.description}</div>
              </div>
            </div>
          )
          return (
            <div key={p.key} className="iho-stagger" style={{ gridColumn: slot.col, gridRow: slot.row, height: '100%' }}>
              {p.href ? <a href={p.href} style={{ display: 'block', height: '100%', color: 'inherit' }}>{card}</a> : card}
            </div>
          )
        })}
      </StaggerGrid>
    </section>
  )
}
