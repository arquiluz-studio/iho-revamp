import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { PageShell } from '@/components/site/pages/PageParts'
import { innerChrome } from '@/components/site/SiteChrome'
import { TeamProfile } from '@/components/site/TeamProfile'
import { COUNTRY_CODES, LOCALES } from '@/config/countries'
import { legacyMedia } from '@/lib/content/legacy-media'
import { sitePaths } from '@/lib/content/paths'
import { imageOf } from '@/lib/content/site'
import { paragraphs, t } from '@/lib/i18n-fields'
import { getTeam, getTeamMember } from '@/lib/queries/site'
import { buildAlternates } from '@/lib/seo'
import { resolveSiteParams, type SiteParams } from '@/lib/site-params'

type Params = SiteParams & { slug: string }

export const revalidate = 3600

export async function generateStaticParams() {
  const lists = await Promise.all(COUNTRY_CODES.map(async country => ({ country, members: await getTeam(country) })))
  return lists.flatMap(({ country, members }) => LOCALES.flatMap(locale => members.map(member => ({ country, locale, slug: member.slug }))))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { country, locale } = await resolveSiteParams(params)
  const { slug } = await params
  const member = await getTeamMember(country, slug)
  if (!member) return {}
  const bio = t(member, 'bio', locale)
  return {
    title: `${member.full_name} — IHO`,
    description: bio.slice(0, 160) || t(member, 'role', locale) || undefined,
    alternates: buildAlternates({ href: { pathname: '/team/[slug]', params: { slug } }, country, locale }),
  }
}

export default async function TeamMemberPage({ params }: { params: Promise<Params> }) {
  const { country, locale } = await resolveSiteParams(params)
  const { slug } = await params
  const paths = sitePaths(locale)
  const [member, tp, chrome] = await Promise.all([
    getTeamMember(country, slug),
    getTranslations({ locale, namespace: 'pages.team' }),
    innerChrome(country, locale, paths),
  ])
  if (!member) notFound()

  return (
    <PageShell chrome={chrome} hero={false}>
      <TeamProfile
        backHref={`${paths.group}#equipo`}
        backLabel={tp('back')}
        name={member.full_name}
        role={t(member, 'role', locale)}
        bio={paragraphs(t(member, 'bio', locale))}
        email={member.email}
        phone={member.phone}
        linkedinUrl={member.linkedin_url}
        linkedinLabel={tp('linkedin')}
        portrait={imageOf(member.photo, locale, member.full_name, legacyMedia.teamPhoto(member.full_name), 'lg')}
        objectPosition={member.photo_position ?? undefined}
      />
    </PageShell>
  )
}
