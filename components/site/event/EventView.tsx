import type { EventDetailVM } from '@/lib/types/site'
import type { SiteChrome } from '../HomeView'
import { EventHero } from './EventHero'
import { EventAbout, EventFacts } from './EventInfo'
import { EventRegistration, type RegistrationResult } from './EventRegistration'
import { EventBrands, EventCta, EventDesigners, EventGallery, EventPreviousEditions, EventProducts } from './EventShowcase'

type Props = {
  event: EventDetailVM
  chrome: SiteChrome
  contactHref: string
  privacyHref?: string
  register?: (formData: FormData) => Promise<RegistrationResult>
}

export function EventView({ event, chrome, contactHref, privacyHref, register }: Props) {
  const showRegistration = !event.isPast && event.registration.enabled
  return (
    <div style={{ width: '100%', overflowX: 'hidden' }}>
      {chrome.banner}
      {chrome.header}
      <EventHero event={event} showRegistration={showRegistration} />
      <EventFacts event={event} />
      <EventAbout event={event} />
      {showRegistration && (
        <EventRegistration eventId={event.id} closed={event.registration.closed} privacyHref={privacyHref} action={register} />
      )}
      <EventBrands brands={event.brands} />
      <EventDesigners designers={event.designers} />
      <EventProducts products={event.products} />
      {event.isPast ? <EventGallery images={event.gallery} past /> : <EventPreviousEditions editions={event.previousEditions} />}
      <EventCta href={contactHref} />
      {event.jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(event.jsonLd).replace(/</g, '\\u003c') }} />}
      {chrome.footer}
    </div>
  )
}
