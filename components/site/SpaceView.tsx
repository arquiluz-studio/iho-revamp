import { MediaImage } from '@/components/ui/MediaImage'
import { RichText } from '@/components/ui/Section'
import type { ImageVM, NavLink } from '@/lib/types/site'
import { HeroCtas } from './HeroCtas'
import { Chips } from './pages/PageParts'

type Shot = { title: string; text: string; image: ImageVM | null }

export type SpaceStory = {
  name: string
  hero: ImageVM | null
  heroIntro: string[]
  heroCta: string
  spaces: NavLink[]
  currentHref: string
  contactHref: string
  intro: { eyebrow: string; title: string; body: string[]; cta: string; image: ImageVM | null } | null
  banner: { title: string; text: string[] } | null
  elements: { eyebrow: string; title: string; intro: string[]; items: Shot[]; more: NavLink | null } | null
  solutions: { label: string; href: string }[]
  projects: { eyebrow: string; title: string; intro: string[]; items: { href: string; caption: string; text: string; image: ImageVM | null }[]; more: NavLink | null } | null
  quote: { text: string; attribution: string } | null
  process: { eyebrow: string; title: string; intro: string[]; steps: { title: string; text: string }[] } | null
  brands: { eyebrow: string; items: { name: string; href: string; image: ImageVM | null }[] } | null
  close: { eyebrow: string; title: string; body: string[]; cta: string } | null
}

/** Long layout of a space page. Empty sections are left out by the caller. */
export function SpaceView({ story }: { story: SpaceStory }) {
  const contact = (label: string) => (label ? [{ href: story.contactHref, label, style: 'red' as const, newWindow: false }] : [])
  const projectStart = (story.elements?.items.length ?? 0) + 1

  return (
    <article className="iho-story">
      <section className="iho-story-hero">
        {story.hero && <MediaImage image={story.hero} alt="" priority sizes="100vw" />}
        <div className="iho-story-hero__inner">
          <div>
            <h1>{story.name}</h1>
            {story.spaces.length > 0 && (
              <div className="iho-chips-dark iho-story-hero__chips">
                <Chips links={story.spaces} current={story.currentHref} />
              </div>
            )}
            <HeroCtas actions={contact(story.heroCta)} marginTop={22} />
          </div>
          {story.heroIntro.length > 0 && (
            <div className="iho-story-hero__aside">
              {story.heroIntro.map(paragraph => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          )}
        </div>
      </section>

      {story.intro && (
        <section className="iho-story-split">
          <div>
            {story.intro.eyebrow && <p className="iho-story-kicker">{story.intro.eyebrow}</p>}
            {story.intro.title && (
              <h2>
                <RichText text={story.intro.title} />
              </h2>
            )}
            {story.intro.body.map(paragraph => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <HeroCtas actions={contact(story.intro.cta)} marginTop={28} />
          </div>
          <Photo image={story.intro.image} sizes="(max-width: 768px) 100vw, 640px" tall />
        </section>
      )}

      {story.banner && (
        <section className="iho-story-statement">
          {story.banner.title && (
            <h2>
              <RichText text={story.banner.title} />
            </h2>
          )}
          {story.banner.text.map(paragraph => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
      )}

      {story.elements && (
        <section className="iho-story-block" aria-labelledby="space-elements">
          <Head id="space-elements" kicker={story.elements.eyebrow} title={story.elements.title} aside={story.elements.intro} />
          {story.elements.items.length > 0 && (
            <div className="iho-story-cards">
              {story.elements.items.map((item, index) => (
                <article key={index} className="iho-story-card">
                  <Photo image={item.image} sizes="(max-width: 768px) 100vw, 400px" />
                  {item.title && (
                    <h3>
                      <span>{number(index)}</span>
                      {item.title}
                    </h3>
                  )}
                  {item.text && <p>{item.text}</p>}
                </article>
              ))}
            </div>
          )}
          {story.elements.more && (
            <p className="iho-story-more">
              <a href={story.elements.more.href}>{story.elements.more.label} →</a>
            </p>
          )}
        </section>
      )}

      {story.solutions.length > 0 && (
        <section className="iho-story-cats" aria-label="Soluciones">
          <ul>
            {story.solutions.map(item => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {story.projects && (
        <section className="iho-story-block" aria-labelledby="space-projects">
          <Head id="space-projects" kicker={story.projects.eyebrow} title={story.projects.title} aside={story.projects.intro} />
          {story.projects.items.length > 0 && (
            <div className="iho-story-gallery">
              {story.projects.items.map((item, index) => (
                <a key={item.href} href={item.href}>
                  <Photo image={item.image} sizes="(max-width: 768px) 100vw, 600px" />
                  {item.caption && (
                    <p className="iho-story-gallery__title">
                      <span>{number(projectStart + index - 1)}</span>
                      {item.caption}
                    </p>
                  )}
                  {item.text && <p>{item.text}</p>}
                </a>
              ))}
            </div>
          )}
          {story.projects.more && (
            <p className="iho-story-more">
              <a href={story.projects.more.href}>{story.projects.more.label} →</a>
            </p>
          )}
        </section>
      )}

      {story.quote && (
        <figure className="iho-story-quote">
          <blockquote>
            <RichText text={story.quote.text} />
          </blockquote>
          {story.quote.attribution && <figcaption>{story.quote.attribution}</figcaption>}
        </figure>
      )}

      {story.process && (
        <section className="iho-story-block" aria-labelledby="space-process">
          <Head id="space-process" kicker={story.process.eyebrow} title={story.process.title} aside={story.process.intro} />
          {story.process.steps.length > 0 && (
            <ol className="iho-story-steps">
              {story.process.steps.map((step, index) => (
                <li key={`${step.title}-${index}`}>
                  <span>{number(index)}</span>
                  <div>
                    {step.title && <h3>{step.title}</h3>}
                    {step.text && <p>{step.text}</p>}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}

      {story.brands && (
        <section className="iho-story-block" aria-label="Marcas">
          {story.brands.eyebrow && <p className="iho-story-kicker">{story.brands.eyebrow}</p>}
          <ul className="iho-story-logos">
            {story.brands.items.map(item => (
              <li key={item.href}>
                <a href={item.href} aria-label={item.name}>
                  {item.image ? (
                    <MediaImage image={item.image} alt="" sizes="180px" style={{ maxWidth: '72%', maxHeight: 42, width: 'auto', height: 'auto', objectFit: 'contain' }} />
                  ) : (
                    <span>{item.name}</span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {story.close && (
        <section className="iho-story-close">
          <div>
            {story.close.eyebrow && <p className="iho-story-kicker is-muted">{story.close.eyebrow}</p>}
            {story.close.title && (
              <h2>
                <RichText text={story.close.title} />
              </h2>
            )}
            {story.close.body.map(paragraph => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <HeroCtas actions={contact(story.close.cta)} />
        </section>
      )}
    </article>
  )
}

function Head({ id, kicker, title, aside }: { id?: string; kicker: string; title: string; aside: string[] }) {
  if (!kicker && !title && aside.length === 0) return null
  return (
    <div className="iho-story-head">
      <div>
        {kicker && <p className="iho-story-kicker">{kicker}</p>}
        {title && (
          <h2 id={id}>
            <RichText text={title} />
          </h2>
        )}
      </div>
      {aside.length > 0 && (
        <div>
          {aside.map(paragraph => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      )}
    </div>
  )
}

function Photo({ image, sizes, tall = false }: { image: ImageVM | null; sizes: string; tall?: boolean }) {
  return <div className={tall ? 'iho-solution-photo is-tall' : 'iho-solution-photo'}>{image && <MediaImage image={image} alt="" sizes={sizes} />}</div>
}

function number(index: number) {
  return String(index + 1).padStart(2, '0')
}
