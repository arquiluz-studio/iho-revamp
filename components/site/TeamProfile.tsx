import { LinkedInIcon } from '@/components/ui/icons'
import { MediaImage } from '@/components/ui/MediaImage'
import type { ImageVM } from '@/lib/types/site'

export function TeamProfile({
  backHref,
  backLabel,
  name,
  role,
  bio,
  email,
  phone,
  linkedinUrl,
  linkedinLabel,
  portrait,
  objectPosition,
}: {
  backHref: string
  backLabel: string
  name: string
  role: string
  bio: string[]
  email?: string | null
  phone?: string | null
  linkedinUrl?: string | null
  linkedinLabel: string
  portrait: ImageVM
  objectPosition?: string
}) {
  return (
    <article className="iho-designer">
      <p className="iho-crumb">
        <a href={backHref}>{backLabel}</a>
        <span aria-hidden="true"> / </span>
        <span>{name}</span>
      </p>
      <div className="iho-designer-hero">
        <div>
          {role && <p className="iho-designer-kicker">{role}</p>}
          <h1>{name}</h1>
          {bio.map(paragraph => (
            <p key={paragraph} className="iho-designer-bio">
              {paragraph}
            </p>
          ))}
          {(email || phone || linkedinUrl) && (
            <ul className="iho-team-links">
              {email && (
                <li>
                  <a href={`mailto:${email}`}>{email}</a>
                </li>
              )}
              {phone && (
                <li>
                  <a href={`tel:${phone.replace(/[^\d+]/g, '')}`}>{phone}</a>
                </li>
              )}
              {linkedinUrl && (
                <li>
                  <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
                    <LinkedInIcon size={16} />
                    {linkedinLabel}
                  </a>
                </li>
              )}
            </ul>
          )}
        </div>
        <div className="iho-designer-portrait" style={{ aspectRatio: '3 / 4' }}>
          <MediaImage image={portrait} sizes="(max-width: 768px) 100vw, 520px" style={{ objectPosition }} />
        </div>
      </div>
    </article>
  )
}
