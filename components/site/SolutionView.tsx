import { MediaImage } from '@/components/ui/MediaImage'
import { RichText } from '@/components/ui/Section'
import { HeroCtas } from './HeroCtas'
import type { ImageVM } from '@/lib/types/site'

export type SolutionInclude = { title: string; text: string; image: ImageVM | null }
export type SolutionProject = { key: string; title: string; href: string; image: ImageVM | null; meta?: string }
export type SolutionFitCard = { key: string; title: string; text: string; href: string; image: ImageVM | null }

export function FitSection({ id, label, title, items }: { id: string; label: string; title: string; items: SolutionFitCard[] }) {
  if (!items.length) return null
  return (
    <section className="iho-solution-block" aria-labelledby={id}>
      <p className="iho-solution-kicker">{label}</p>
      <h2 id={id}>
        <RichText text={title} />
      </h2>
      <div className="iho-solution-includes">
        {items.map(item => (
          <a key={item.key} href={item.href} className="iho-solution-include">
            <div className="iho-solution-photo">
              {item.image && <MediaImage image={item.image} alt="" sizes="(max-width: 768px) 100vw, 400px" />}
            </div>
            <h3>{item.title}</h3>
            {item.text && <p>{item.text}</p>}
          </a>
        ))}
      </div>
    </section>
  )
}

export function SolutionView({
  name,
  description,
  hero,
  statementImage,
  includes,
  spaces,
  projects,
  quoteHref,
  quoteLabel,
  statementTitle,
  includesLabel,
  includesTitle,
  spacesLabel,
  spacesTitle,
  projectsLabel,
  projectsTitle,
  allProjectsHref,
  allProjectsLabel,
  closeTitle,
  closeBody,
}: {
  name: string
  description: string[]
  hero: ImageVM | null
  statementImage: ImageVM | null
  includes: SolutionInclude[]
  spaces: SolutionFitCard[]
  projects: SolutionProject[]
  quoteHref: string
  quoteLabel: string
  statementTitle: string
  includesLabel: string
  includesTitle: string
  spacesLabel: string
  spacesTitle: string
  projectsLabel: string
  projectsTitle: string
  allProjectsHref: string
  allProjectsLabel: string
  closeTitle: string
  closeBody: string
}) {
  const quote = [{ href: quoteHref, label: quoteLabel, style: 'red' as const, newWindow: false }]

  return (
    <article className="iho-solution">
      <section className="iho-solution-hero">
        {hero && <MediaImage image={hero} alt="" priority sizes="100vw" />}
        <div className="iho-solution-hero__inner">
          <h1>{name}</h1>
          <HeroCtas actions={quote} />
        </div>
      </section>

      <section className="iho-solution-statement">
        <div>
          <h2>
            <RichText text={statementTitle} />
          </h2>
          {description.map(paragraph => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        {statementImage && (
          <div className="iho-solution-photo">
            <MediaImage image={statementImage} alt="" sizes="(max-width: 768px) 100vw, 640px" />
          </div>
        )}
      </section>

      {includes.length > 0 && (
        <section className="iho-solution-block" aria-labelledby="solution-includes">
          <p className="iho-solution-kicker">{includesLabel}</p>
          <h2 id="solution-includes">
            <RichText text={includesTitle} />
          </h2>
          <div className="iho-solution-includes">
            {includes.map(item => (
              <article key={item.title} className="iho-solution-include">
                <div className="iho-solution-photo">
                  {item.image && <MediaImage image={item.image} alt="" sizes="(max-width: 768px) 100vw, 400px" />}
                </div>
                <h3>{item.title}</h3>
                {item.text && <p>{item.text}</p>}
              </article>
            ))}
          </div>
        </section>
      )}

      <FitSection id="solution-spaces" label={spacesLabel} title={spacesTitle} items={spaces} />

      {projects.length > 0 && (
        <section className="iho-solution-block" aria-labelledby="solution-projects">
          <div className="iho-solution-projects-head">
            <div>
              <p className="iho-solution-kicker">{projectsLabel}</p>
              <h2 id="solution-projects">
                <RichText text={projectsTitle} />
              </h2>
            </div>
            <a className="iho-solution-more" href={allProjectsHref}>
              {allProjectsLabel}
              <svg aria-hidden="true" width={12} height={12} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.4}>
                <path d="M1.5 6h8M6.5 2.5 10 6 6.5 9.5" />
              </svg>
            </a>
          </div>
          <div className="iho-solution-projects">
            {projects.map(project => (
              <a key={project.key} href={project.href} className="iho-solution-project">
                <div className="iho-solution-photo">
                  {project.image && <MediaImage image={project.image} alt="" sizes="(max-width: 768px) 100vw, 600px" />}
                </div>
                <h3>{project.title}</h3>
                {project.meta && <p>{project.meta}</p>}
              </a>
            ))}
          </div>
        </section>
      )}

      <section className="iho-solution-close">
        <div>
          <h2>
            <RichText text={closeTitle} />
          </h2>
          {closeBody && <p>{closeBody}</p>}
        </div>
        <HeroCtas actions={quote} />
      </section>
    </article>
  )
}
