import { useTranslations } from 'next-intl'
import { DisplayTitle, RichText, SectionLabel } from '@/components/ui/Section'
import type { MapCountryVM, StatVM } from '@/lib/types/site'
import { GroupMap } from './GroupMap'
import { StatsCounter } from './StatsCounter'

export function GroupSection({ stats, mapCountries, showIntro = true }: { stats: StatVM[]; mapCountries: MapCountryVM[]; showIntro?: boolean }) {
  const t = useTranslations('home.group')
  return (
    <section id="grupo" className="iho-group">
      <div className="iho-group__inner">
        {showIntro && (
          <div className="iho-group__intro">
            <SectionLabel>{t('label')}</SectionLabel>
            <DisplayTitle style={{ margin: '0 0 28px' }}>
              <RichText text={t('title')} />
            </DisplayTitle>
            <p>{t('p1')}</p>
            <p>{t('p2')}</p>
          </div>
        )}
        <StatsCounter stats={stats} />
        <GroupMap countries={mapCountries} title={t('mapTitle')} placesLabel={t('places')} eyebrow={t('mapEyebrow')} caption={t('mapCaption')} />
      </div>
    </section>
  )
}
