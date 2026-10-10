import { useTranslations } from 'next-intl'
import { DisplayTitle, RichText, SectionLabel } from '@/components/ui/Section'
import type { MapCountryVM, StatVM } from '@/lib/types/site'
import { GroupMap } from './GroupMap'
import { StatsCounter } from './StatsCounter'

export function GroupSection({ stats, mapCountries, showIntro = true }: { stats: StatVM[]; mapCountries: MapCountryVM[]; showIntro?: boolean }) {
  const t = useTranslations('home.group')
  return (
    <section id="grupo" style={{ backgroundColor: '#ffffff' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '84px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: showIntro ? '0.92fr 1.18fr 0.5fr' : '1.4fr 0.5fr', gap: 48, alignItems: 'start' }}>
          {showIntro && (
            <div>
              <SectionLabel>{t('label')}</SectionLabel>
              <DisplayTitle style={{ margin: '0 0 28px' }}><RichText text={t('title')} /></DisplayTitle>
              <p style={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: 15, lineHeight: 1.65, color: '#5a554b', margin: '0 0 18px', maxWidth: 330 }}>{t('p1')}</p>
              <p style={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: 15, lineHeight: 1.65, color: '#5a554b', margin: 0, maxWidth: 330 }}>{t('p2')}</p>
            </div>
          )}
          <div style={{ position: 'relative', minHeight: 520 }}>
            <GroupMap countries={mapCountries} title={t('mapTitle')} />
            <div className="iho-ciudad-list" style={{ position: 'absolute', left: 20, top: '45%', fontFamily: '"Source Sans 3", sans-serif', fontSize: 15, lineHeight: 1.4, pointerEvents: 'none' }}>
              {mapCountries.map(c => c.isCurrent
                ? c.cities.map((city, i) => <div key={`${c.code}-${city}`} style={{ color: '#3F3E3C', fontWeight: i === 0 ? 700 : 400 }}>{city}</div>)
                : <div key={c.code} style={{ color: '#B5B5B5' }}>{c.name}</div>)}
            </div>
          </div>
          <StatsCounter stats={stats} />
        </div>
      </div>
    </section>
  )
}
