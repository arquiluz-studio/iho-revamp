'use client'
import { useMemo, useState } from 'react'
import { MediaImage } from '@/components/ui/MediaImage'
import { SectionLabel } from '@/components/ui/Section'
import type { ImageVM } from '@/lib/types/site'

export type DirectoryBrand = {
  slug: string
  name: string
  href?: string
  logo: ImageVM | null
  cover?: ImageVM | null
  thin?: boolean
  lines: string[]
}

export type DirectoryFilter = { slug: string; label: string }

const ALPHABET = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))

function fold(value: string) {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
}

function letterOf(name: string) {
  const letter = fold(name).trim().charAt(0).toUpperCase()
  return /[A-Z]/.test(letter) ? letter : '#'
}

export function BrandDirectory({
  label,
  title,
  brands,
  filters,
  locale,
  lettersLabel,
  searchLabel,
  allLabel,
  emptyLabel,
  noMatchLabel,
  photo = false,
  idPrefix = 'marca',
}: {
  label: string
  title: string
  brands: DirectoryBrand[]
  filters: DirectoryFilter[]
  locale: string
  lettersLabel: string
  searchLabel: string
  allLabel: string
  emptyLabel: string
  noMatchLabel: string
  /** Portrait tiles instead of logo cutouts. */
  photo?: boolean
  idPrefix?: string
}) {
  const [query, setQuery] = useState('')
  const [line, setLine] = useState('all')

  const groups = useMemo(() => {
    const needle = fold(query.trim())
    const visible = brands
      .filter(brand => (line === 'all' || brand.lines.includes(line)) && (!needle || fold(brand.name).includes(needle)))
      .sort((a, b) => a.name.localeCompare(b.name, locale, { sensitivity: 'base' }))
    const byLetter = new Map<string, DirectoryBrand[]>()
    for (const brand of visible) {
      const letter = letterOf(brand.name)
      byLetter.set(letter, [...(byLetter.get(letter) ?? []), brand])
    }
    return byLetter
  }, [brands, line, locale, query])

  const letters = groups.has('#') ? [...ALPHABET, '#'] : ALPHABET
  const jump = (letter: string) => document.getElementById(`${idPrefix}-${letter}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <section className="iho-brands-directory">
      <div className="iho-brands-intro">
        <div>
          <SectionLabel>{label}</SectionLabel>
          <h1>{title}</h1>
        </div>
      </div>

      <nav className="iho-alpha" aria-label={lettersLabel}>
        {letters.map(letter => {
          const on = groups.has(letter)
          return (
            <button key={letter} type="button" className={on ? 'is-on' : undefined} disabled={!on} onClick={() => jump(letter)}>
              {letter}
            </button>
          )
        })}
      </nav>

      <div className="iho-brands-tools">
        <label className="iho-brands-search">
          <svg aria-hidden="true" width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4}>
            <circle cx="7" cy="7" r="4.5" />
            <path d="M10.5 10.5 14 14" strokeLinecap="round" />
          </svg>
          <input type="search" value={query} placeholder={searchLabel} aria-label={searchLabel} onChange={event => setQuery(event.target.value)} />
        </label>
        {filters.length > 0 && (
          <div className="iho-brands-filters" role="group" aria-label={allLabel}>
            <button type="button" aria-pressed={line === 'all'} onClick={() => setLine('all')}>
              {allLabel}
            </button>
            {filters.map(filter => (
              <button key={filter.slug} type="button" aria-pressed={line === filter.slug} onClick={() => setLine(filter.slug)}>
                {filter.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {brands.length === 0 ? (
        <p className="iho-brands-empty">{emptyLabel}</p>
      ) : groups.size === 0 ? (
        <p className="iho-brands-empty">{noMatchLabel}</p>
      ) : (
        <div>
          {letters.filter(letter => groups.has(letter)).map(letter => (
            <section key={letter} id={`${idPrefix}-${letter}`} className="iho-brand-group" aria-labelledby={`${idPrefix}-h-${letter}`}>
              <h2 id={`${idPrefix}-h-${letter}`}>{letter}</h2>
              <div className="iho-brand-cards">
                {groups.get(letter)?.map(brand => {
                  const image = brand.cover ?? brand.logo
                  const isPhoto = photo || Boolean(brand.cover)
                  const body = (
                    <>
                      <div className="iho-brand-tile__mark">
                        {image ? (
                          <MediaImage image={image} alt="" />
                        ) : (
                          <span aria-hidden="true" className={isPhoto ? 'iho-brand-tile__word iho-brand-tile__word--name' : 'iho-brand-tile__word'}>{brand.name}</span>
                        )}
                      </div>
                      <span className="iho-brand-tile__meta">
                        <span>{brand.name}</span>
                        <svg aria-hidden="true" width={14} height={14} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={1.4}>
                          <path d="M5 2.5 9.5 7 5 11.5" />
                        </svg>
                      </span>
                    </>
                  )
                  const className = `iho-brand-tile${isPhoto ? ' iho-brand-tile--photo' : ''}${!isPhoto && brand.thin ? ' iho-brand-tile--thin' : ''}`
                  return brand.href ? (
                    <a key={brand.slug} href={brand.href} className={className}>
                      {body}
                    </a>
                  ) : (
                    <div key={brand.slug} className={className}>
                      {body}
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  )
}
