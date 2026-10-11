'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { shopHref, type ShopQuery, type ShopSort } from '@/lib/content/shop-query'
import type { ProductCardVM } from '@/lib/types/site'
import { ProductCard } from './ProductCard'
import { EmptyNote } from './pages/PageParts'

export type ShopFacet = { key: string; label: string }

export type ShopProduct = {
  card: ProductCardVM
  name: string
  brandName: string
  brandKey: string
  designers: ShopFacet[]
  line: ShopFacet | null
  spaces: ShopFacet[]
  priceAmount: number | null
  order: number
}

type Option = { id: string; label: string; count: number }
type Group = 'line' | 'space' | 'brand' | 'designer'
type SearchParams = Record<string, string | string[] | undefined>

function fold(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
}

function matches(product: ShopProduct, query: ShopQuery, except?: Group): boolean {
  if (query.q) {
    const needle = fold(query.q)
    const hay = fold([product.name, product.brandName, ...product.designers.map(d => d.label)].join(' '))
    if (!hay.includes(needle)) return false
  }
  if (query.priced && product.priceAmount == null) return false
  if (except !== 'line' && query.lines.length && (!product.line || !query.lines.includes(product.line.key))) return false
  if (except !== 'space' && query.spaces.length && !product.spaces.some(space => query.spaces.includes(space.key))) return false
  if (except !== 'brand' && query.brands.length && !query.brands.includes(product.brandKey)) return false
  if (except !== 'designer' && query.designers.length && !product.designers.some(d => query.designers.includes(d.key))) return false
  return true
}

function optionsFor(products: ShopProduct[], query: ShopQuery, group: Group, selected: string[]): Option[] {
  const pool = products.filter(product => matches(product, query, group))
  const seen = new Map<string, string>()
  for (const product of products) {
    const facets =
      group === 'line' ? (product.line ? [product.line] : []) : group === 'space' ? product.spaces : group === 'brand' ? [{ key: product.brandKey, label: product.brandName }] : product.designers
    for (const facet of facets) if (!seen.has(facet.key)) seen.set(facet.key, facet.label)
  }
  return [...seen.entries()]
    .map(([id, label]) => ({
      id,
      label,
      count: pool.filter(product => {
        if (group === 'line') return product.line?.key === id
        if (group === 'space') return product.spaces.some(space => space.key === id)
        if (group === 'brand') return product.brandKey === id
        return product.designers.some(d => d.key === id)
      }).length,
    }))
    .filter(option => option.count > 0 || selected.includes(option.id))
    .sort((a, b) => a.label.localeCompare(b.label))
}

function compare(sort: ShopSort, a: ShopProduct, b: ShopProduct): number {
  if (sort === 'name') return a.name.localeCompare(b.name)
  if (sort === 'price-asc' || sort === 'price-desc') {
    if (a.priceAmount == null && b.priceAmount == null) return a.order - b.order
    if (a.priceAmount == null) return 1
    if (b.priceAmount == null) return -1
    const diff = sort === 'price-asc' ? a.priceAmount - b.priceAmount : b.priceAmount - a.priceAmount
    return diff || a.order - b.order
  }
  return a.order - b.order
}

function FilterGroup({ label, options, value, onChange }: { label: string; options: Option[]; value: string[]; onChange: (next: string[]) => void }) {
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

export function ShopBrowser({ products, query, params }: { products: ShopProduct[]; query: ShopQuery; params: SearchParams }) {
  const t = useTranslations('pages.products')
  const router = useRouter()
  const pathname = usePathname()
  const [draft, setDraft] = useState(query.q)
  const latest = useRef({ query, params, pathname })
  latest.current = { query, params, pathname }

  useEffect(() => {
    setDraft(query.q)
  }, [query.q])

  const go = (next: ShopQuery) => router.replace(shopHref(pathname, next, params), { scroll: false })

  useEffect(() => {
    if (draft === latest.current.query.q) return
    const id = window.setTimeout(() => {
      const current = latest.current
      router.replace(shopHref(current.pathname, { ...current.query, q: draft }, current.params), { scroll: false })
    }, 250)
    return () => window.clearTimeout(id)
  }, [draft, router])

  const visible = products.filter(product => matches(product, query)).sort((a, b) => compare(query.sort, a, b))
  const pricedCount = products.filter(product => matches(product, { ...query, priced: false }) && product.priceAmount != null).length
  const hasFilters = Boolean(query.q || query.lines.length || query.spaces.length || query.brands.length || query.designers.length || query.priced || query.sort !== 'featured')
  const toggle = (key: keyof Pick<ShopQuery, 'lines' | 'spaces' | 'brands' | 'designers'>, next: string[]) => go({ ...query, [key]: next })

  return (
    <section className="iho-page-section">
      <div className="iho-browse">
        <aside className="iho-browse-side" aria-label={t('filters')}>
          <div className="iho-browse-head">
            <span>{t('filters')}</span>
            {hasFilters && (
              <button type="button" className="iho-browse-clear" onClick={() => go({ q: '', lines: [], spaces: [], brands: [], designers: [], priced: false, sort: 'featured' })}>
                {t('clear')}
              </button>
            )}
          </div>
          <FilterGroup label={t('filterSolution')} options={optionsFor(products, query, 'line', query.lines)} value={query.lines} onChange={next => toggle('lines', next)} />
          <FilterGroup label={t('filterSpace')} options={optionsFor(products, query, 'space', query.spaces)} value={query.spaces} onChange={next => toggle('spaces', next)} />
          <FilterGroup label={t('filterBrand')} options={optionsFor(products, query, 'brand', query.brands)} value={query.brands} onChange={next => toggle('brands', next)} />
          <FilterGroup label={t('filterDesigner')} options={optionsFor(products, query, 'designer', query.designers)} value={query.designers} onChange={next => toggle('designers', next)} />
          {(pricedCount > 0 || query.priced) && (
            <details className="iho-filter-group" open>
              <summary>{t('price')}</summary>
              <ul className="iho-filter-list">
                <li>
                  <label className="iho-check">
                    <input type="checkbox" checked={query.priced} onChange={() => go({ ...query, priced: !query.priced })} />
                    <span className="iho-check-box" aria-hidden />
                    <span className="iho-check-label">{t('filterPriced')}</span>
                    <span className="iho-check-count">{pricedCount}</span>
                  </label>
                </li>
              </ul>
            </details>
          )}
        </aside>
        <div>
          <div className="iho-shop-toolbar">
            <input
              className="iho-shop-search"
              type="search"
              value={draft}
              placeholder={t('searchPlaceholder')}
              aria-label={t('search')}
              onChange={event => setDraft(event.target.value)}
            />
            <label className="iho-shop-sort">
              <span>{t('sort')}</span>
              <select value={query.sort} aria-label={t('sort')} onChange={event => go({ ...query, sort: event.target.value as ShopSort })}>
                <option value="featured">{t('sortFeatured')}</option>
                <option value="name">{t('sortName')}</option>
                <option value="price-asc">{t('sortPriceAsc')}</option>
                <option value="price-desc">{t('sortPriceDesc')}</option>
              </select>
            </label>
          </div>
          <p className="iho-browse-count" aria-live="polite">
            {t('count', { count: visible.length })}
          </p>
          {visible.length ? (
            <div className="iho-product-grid">
              {visible.map(product => (
                <ProductCard key={product.card.key} product={product.card} />
              ))}
            </div>
          ) : (
            <EmptyNote>{products.length ? t('noMatch') : t('empty')}</EmptyNote>
          )}
        </div>
      </div>
    </section>
  )
}
