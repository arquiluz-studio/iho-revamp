import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { BrandDirectory } from '@/components/site/BrandDirectory'
import { PageShell } from '@/components/site/pages/PageParts'
import { innerChrome } from '@/components/site/SiteChrome'
import { heroDocumentTitle, resolvePageHero } from '@/lib/content/page-hero'
import { sitePaths } from '@/lib/content/paths'
import { imageOrNull } from '@/lib/content/site'
import { t } from '@/lib/i18n-fields'
import { getDesigners } from '@/lib/queries/designers'
import { buildAlternates } from '@/lib/seo'
import { resolveSiteParams, type SiteParams } from '@/lib/site-params'

export async function generateMetadata({ params }: { params: Promise<SiteParams> }): Promise<Metadata> {
  const { country, locale } = await resolveSiteParams(params)
  const hero = await resolvePageHero(country, 'designers', locale)
  return { title: heroDocumentTitle(hero.title), alternates: buildAlternates({ href: '/designers', country, locale }) }
}

export default async function DesignersPage({ params }: { params: Promise<SiteParams> }) {
  const { country, locale } = await resolveSiteParams(params)
  const paths = sitePaths(locale)
  const [tp, designers, chrome] = await Promise.all([
    getTranslations({ locale, namespace: 'pages.designers' }),
    getDesigners(),
    innerChrome(country, locale, paths),
  ])
  const nationalities = [...new Set(designers.map(d => t(d, 'nationality', locale)).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, locale, { sensitivity: 'base' }),
  )

  return (
    <PageShell chrome={chrome} hero={false}>
      <BrandDirectory
        label={tp('label')}
        title={tp('heading')}
        intro={tp('intro')}
        photo
        idPrefix="disenador"
        locale={locale}
        lettersLabel={tp('letters')}
        searchLabel={tp('search')}
        allLabel={tp('allFilter')}
        emptyLabel={tp('empty')}
        noMatchLabel={tp('noMatch')}
        filters={nationalities.length > 1 ? nationalities.map(name => ({ slug: name, label: name })) : []}
        brands={designers.map(designer => {
          const photo = imageOrNull(designer.portrait, locale, designer.name, null, 'md')
          return {
            slug: designer.slug,
            name: designer.name,
            href: paths.designer(designer.slug),
            logo: photo ? { ...photo, color: null, placeholder: null } : null,
            lines: [t(designer, 'nationality', locale)].filter(Boolean),
          }
        })}
      />
    </PageShell>
  )
}
