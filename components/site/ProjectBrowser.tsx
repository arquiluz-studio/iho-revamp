'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import type { ProjectCardVM } from '@/lib/types/site'
import { EmptyNote, ProjectCards } from './pages/PageParts'

export type BrowserProject = ProjectCardVM & {
  country: string
  spaceId: string | null
  solutionIds: string[]
}

type Option = { id: string; label: string; count: number }

/** Selected ids of one filter. Empty means no restriction; several ids are combined with OR. */
type Selection = string[]

function FilterGroup({ label, options, value, onChange }: { label: string; options: Option[]; value: Selection; onChange: (next: Selection) => void }) {
  if (!options.length) return null
  return (
    <details className="iho-filter-group" open>
      <summary>{label}</summary>
      <ul className="iho-filter-list">
        {options.map(option => (
          <li key={option.id}>
            <label className="iho-check">
              <input
                type="checkbox"
                checked={value.includes(option.id)}
                onChange={() => onChange(value.includes(option.id) ? value.filter(id => id !== option.id) : [...value, option.id])}
              />
              <span className="iho-check-box" aria-hidden />
              <span className="iho-check-label">{option.label}</span>
              <span className="iho-check-count">{option.count}</span>
            </label>
          </li>
        ))}
      </ul>
    </details>
  )
}

export function ProjectBrowser({ projects, countries, spaces, solutions }: {
  projects: BrowserProject[]
  countries: Omit<Option, 'count'>[]
  spaces: Omit<Option, 'count'>[]
  solutions: Omit<Option, 'count'>[]
}) {
  const t = useTranslations('pages.projects')
  const [countryIds, setCountryIds] = useState<Selection>([])
  const [spaceIds, setSpaceIds] = useState<Selection>([])
  const [solutionIds, setSolutionIds] = useState<Selection>([])

  const visible = projects.filter(project => {
    if (countryIds.length && !countryIds.includes(project.country)) return false
    if (spaceIds.length && (!project.spaceId || !spaceIds.includes(project.spaceId))) return false
    if (solutionIds.length && !project.solutionIds.some(id => solutionIds.includes(id))) return false
    return true
  })

  const withCount = (options: Omit<Option, 'count'>[], match: (project: BrowserProject, id: string) => boolean): Option[] =>
    options.map(option => ({ ...option, count: projects.filter(project => match(project, option.id)).length }))

  const hasFilters = countryIds.length > 0 || spaceIds.length > 0 || solutionIds.length > 0
  const clear = () => {
    setCountryIds([])
    setSpaceIds([])
    setSolutionIds([])
  }

  return (
    <section className="iho-page-section">
      <div className="iho-browse">
        <aside className="iho-browse-side" aria-label={t('filters')}>
          <div className="iho-browse-head">
            <span>{t('filters')}</span>
            {hasFilters && (
              <button type="button" className="iho-browse-clear" onClick={clear}>
                {t('clear')}
              </button>
            )}
          </div>
          <FilterGroup label={t('filterCountry')} options={withCount(countries, (p, id) => p.country === id)} value={countryIds} onChange={setCountryIds} />
          <FilterGroup label={t('filterSolution')} options={withCount(solutions, (p, id) => p.solutionIds.includes(id))} value={solutionIds} onChange={setSolutionIds} />
          <FilterGroup label={t('filterSpace')} options={withCount(spaces, (p, id) => p.spaceId === id)} value={spaceIds} onChange={setSpaceIds} />
        </aside>
        <div>
          <p className="iho-browse-count" aria-live="polite">{t('count', { count: visible.length })}</p>
          {visible.length ? <ProjectCards projects={visible} twoColumns /> : <EmptyNote>{projects.length ? t('noMatch') : t('empty')}</EmptyNote>}
        </div>
      </div>
    </section>
  )
}
