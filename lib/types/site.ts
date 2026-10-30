// View models consumed by site components. Data sources (static content today,
// Supabase queries later) map their rows into these shapes.

export type ImageVM = {
  src: string
  alt: string
  srcSet?: string
  width?: number | null
  height?: number | null
  placeholder?: string | null
  color?: string | null
}

/** With `items`, the link opens a secondary bar listing them instead of navigating. `arrow` draws the outbound mark used by Comprar. */
export type NavLink = { href: string; label: string; items?: NavLink[]; arrow?: boolean }

export type EventVM = {
  slug: string
  href: string
  startsAt: string
  isPast: boolean
  day: string
  month: string
  city: string
  typeLabel: string
  title: string
  meta: string
  image: ImageVM
}

export type EventDetailVM = EventVM & {
  id?: string
  fullDate: string
  timeRange: string
  venue: string
  access: string
  locationLine: string
  /** Heading of “Sobre el evento”. Empty uses the generic translation. */
  aboutTitle: string
  description: string[]
  /** Heading of the agenda column. Empty uses the generic translation. */
  agendaHeading: string
  agenda: { num: string; text: string }[]
  gallery: ImageVM[]
  /** Past events linked from an upcoming event, newest first. Empty hides the section. */
  previousEditions: { href: string; title: string; image: ImageVM; meta: string }[]
  brands: BrandVM[]
  designers: DesignerCardVM[]
  products: ProductCardVM[]
  registration: {
    enabled: boolean
    closed: boolean
  }
  icsHref?: string
  jsonLd?: Record<string, unknown>
}

export type ProductCardVM = {
  key: string
  name: string
  image: ImageVM
  /** First usage photo, shown when the pointer is over the card. */
  hover?: ImageVM | null
  /** Commercial brand in this country. */
  brand?: string
  category?: string
  href: string
  price?: string
  inquiry?: boolean
}

export type BrandVM = {
  slug: string
  name: string
  logo: ImageVM
  thin?: boolean
  href?: string
}

export type TeamMemberVM = {
  name: string
  role: string
  photo: ImageVM
  objectPosition?: string
  linkedin?: string | null
}

export type OfficeVM = { city: string; address: string; muted?: boolean }

export type SolutionCardVM = {
  num: string
  title: string
  description: string
  image: ImageVM
  href: string
}

export type ProjectCardVM = {
  key: string
  title: string
  description: string
  image: ImageVM
  href?: string
  /** Country and space, shown on the projects index. */
  meta?: string
}

export type DesignerCardVM = {
  key: string
  name: string
  href: string
  image: ImageVM
  /** Nationality and years. */
  meta?: string
}

export type StatVM = { value: number; prefix: string; suffix: string; label: string }

export type HeroCtaVM = {
  label: string
  href: string
  style: 'red' | 'outline' | 'black'
  newWindow: boolean
}

export type MapCityVM = { id: string; name: string; title: string; address: string; mapsUrl: string | null; x: number | null; y: number | null }
export type MapCountryVM = { code: string; name: string; cities: MapCityVM[] }

export type HomeVM = {
  hero: { enabled: boolean; eyebrow: string; title: string; subtitle: string; videoSrc: string | null; poster?: string | null; actions: HeroCtaVM[] }
  sectors: string[]
  products: ProductCardVM[]
  events: EventVM[]
  solutions: SolutionCardVM[]
  brands: BrandVM[]
  projects: ProjectCardVM[]
  offices: OfficeVM[]
  contactImage: ImageVM | null
}
