import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { PageHero, PageShell } from '@/components/site/pages/PageParts'
import { innerChrome } from '@/components/site/SiteChrome'
import { ACUMIN } from '@/components/ui/tokens'
import { sitePaths } from '@/lib/content/paths'
import { buildAlternates } from '@/lib/seo'
import { resolveSiteParams, type SiteParams } from '@/lib/site-params'

export async function generateMetadata({ params }: { params: Promise<SiteParams> }): Promise<Metadata> {
  const { country, locale } = await resolveSiteParams(params)
  const tp = await getTranslations({ locale, namespace: 'pages.privacy' })
  return { title: `${tp('title').replace(/\n/g, ' ')} — IHO`, alternates: buildAlternates({ href: '/privacy', country, locale }) }
}

export default async function PrivacyPage({ params }: { params: Promise<SiteParams> }) {
  const { country, locale } = await resolveSiteParams(params)
  const paths = sitePaths(locale)
  const [tp, chrome] = await Promise.all([getTranslations({ locale, namespace: 'pages.privacy' }), innerChrome(country, locale, paths)])
  const sections = tp.raw('sections') as { title: string; body: string }[]
  return (
    <PageShell chrome={chrome}>
      <PageHero label={tp('label')} title={tp('title')} intro={tp('intro')} />
      <section className="iho-page-section iho-prose" style={{ maxWidth: 900 }}>
        {sections.map(s => (
          <div key={s.title} style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: 26, textTransform: 'uppercase', margin: '0 0 10px', color: '#17150f' }}>{s.title}</h2>
            <p>{s.body}</p>
          </div>
        ))}
      </section>
    </PageShell>
  )
}
