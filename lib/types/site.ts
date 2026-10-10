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

/** `activeOn`: internal (unlocalized) pathname prefixes under which the link shows as current, e.g. `/projects`. */
export type NavLink = { href: string; label: string; activeOn?: string[] }

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
  description: string[]
  agenda: { num: string; text: string }[]
  gallery: ImageVM[]
  brands: BrandVM[]
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
  category?: string
  href: string
  price?: string
  compareAt?: string
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
  linkedinUrl?: string | null
}

export type OfficeVM = { city: string; address: string; muted?: boolean }

export type AreaCardVM = {
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
  /** Country and vertical, shown on the projects index. */
  meta?: string
}

export type StatVM = { value: number; prefix: string; suffix: string; label: string }

export type MapCountryVM = { code: string; name: string; cities: string[]; isCurrent: boolean; hasSite: boolean }

export type HomeVM = {
  hero: { eyebrow: string; title: string; videoSrc: string | null; poster?: string | null }
  sectors: string[]
  products: ProductCardVM[]
  events: EventVM[]
  areas: AreaCardVM[]
  brands: BrandVM[]
  projects: ProjectCardVM[]
  offices: OfficeVM[]
  contactImage: ImageVM
}
