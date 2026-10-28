import { MediaImage } from '@/components/ui/MediaImage'
import { RichText } from '@/components/ui/Section'
import type { ImageVM, NavLink } from '@/lib/types/site'
import { HeroCtas } from './HeroCtas'
import { Chips } from './pages/PageParts'

type Shot = { title: string; text: string; image: ImageVM | null }

export type ArchitecturalStory = {
  name: string
  hero: ImageVM | null
  heroEyebrow: string
  heroIntro: string[]
  heroCta: string
  lines: NavLink[]
  currentHref: string
  contactHref: string
  intro: { eyebrow: string; title: string; body: string[]; cta: string; image: ImageVM | null } | null
  banner: string
  elements: { eyebrow: string; title: string; intro: string[]; items: Shot[] } | null
  categories: string[]
  spaces: { eyebrow: string; title: string; body: string[]; image: ImageVM | null } | null
  process: { eyebrow: string; title: string; intro: string[]; steps: { title: string; text: string }[] } | null
  quote: { text: string; attribution: string } | null
  brands: { eyebrow: string; items: { name: string; image: ImageVM | null }[] } | null
  gallery: { eyebrow: string; items: { caption: string; text: string; image: ImageVM | null }[] }
  close: { eyebrow: string; title: string; body: string[]; cta: string } | null
}

/** Long layout used by Architectural. Empty sections are left out by the caller. */
export function ArchitecturalView({ story }: { story: ArchitecturalStory }) {
  const contact = (label: string) => (label ? [{ href: story.contactHref, label, style: 'red' as const, newWindow: false }] : [])
  const galleryStart = (story.process?.steps.length ?? 0) + 1

  return (
    <article className="iho-story">
      <section className="iho-story-hero">
        {story.hero && <MediaImage image={story.hero} alt="" priority sizes="100vw" />}
        <div className="iho-story-hero__inner">
          <div>
            {story.heroEyebrow && <p className="iho-story-kicker">{story.heroEyebrow}</p>}
            <h1>{story.name}</h1>
            {story.lines.length > 0 && (
              <div className="iho-chips-dark iho-story-hero__chips">
                <Chips links={story.lines} current={story.currentHref} />
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
        <section className="iho-story-banner">
          <p>
            <RichText text={story.banner} />
          </p>
        </section>
      )}

      {story.elements && (
        <section className="iho-story-block" aria-labelledby="story-elements">
          <Head id="story-elements" kicker={story.elements.eyebrow} title={story.elements.title} aside={story.elements.intro} />
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
        </section>
      )}

      {story.categories.length > 0 && (
        <section className="iho-story-cats" aria-label="Categorías">
          <ul>
            {story.categories.map(label => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        </section>
      )}

      {story.spaces && (
        <section className="iho-story-split">
          <div>
            {story.spaces.eyebrow && <p className="iho-story-kicker">{story.spaces.eyebrow}</p>}
            {story.spaces.title && (
              <h2>
                <RichText text={story.spaces.title} />
              </h2>
            )}
            {story.spaces.body.map(paragraph => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <Photo image={story.spaces.image} sizes="(max-width: 768px) 100vw, 640px" tall />
        </section>
      )}

      {story.process && (
        <section className="iho-story-block" aria-labelledby="story-process">
          <Head id="story-process" kicker={story.process.eyebrow} title={story.process.title} aside={story.process.intro} />
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

      {story.quote && (
        <figure className="iho-story-quote">
          <blockquote>
            <RichText text={story.quote.text} />
          </blockquote>
          {story.quote.attribution && <figcaption>{story.quote.attribution}</figcaption>}
        </figure>
      )}

      {story.brands && (
        <section className="iho-story-block" aria-label="Marcas">
          {story.brands.eyebrow && <p className="iho-story-kicker">{story.brands.eyebrow}</p>}
          <ul className="iho-story-logos">
            {story.brands.items.map(item => (
              <li key={item.name}>
                {item.image ? (
                  <MediaImage image={item.image} alt={item.name} sizes="180px" style={{ maxWidth: '72%', maxHeight: 42, width: 'auto', height: 'auto', objectFit: 'contain' }} />
                ) : (
                  <span>{item.name}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {story.gallery.items.length > 0 && (
        <section className="iho-story-block" aria-label="Proyectos">
          {story.gallery.eyebrow && <p className="iho-story-kicker">{story.gallery.eyebrow}</p>}
          <div className="iho-story-gallery">
            {story.gallery.items.map((item, index) => (
              <figure key={`${item.caption}-${index}`}>
                <Photo image={item.image} sizes="(max-width: 768px) 100vw, 600px" />
                {item.caption && (
                  <figcaption>
                    <span>{number(galleryStart + index - 1)}</span>
                    {item.caption}
                  </figcaption>
                )}
                {item.text && <p>{item.text}</p>}
              </figure>
            ))}
          </div>
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
