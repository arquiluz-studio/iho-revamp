// Files in public/ that existed before the media library. `npm run media:import` uploads them and links the
// resulting media_assets; until then the public site falls back to these paths. Remove this module (and the
// files) once every country has run the import.

export const LEGACY_TEAM_FILES: Record<string, string> = {
  'Salvador Miranda': 'equipo-salvador-miranda',
  'Daniela García': 'equipo-daniela-garcia',
  'Lupina Cornejo': 'equipo-lupina-cornejo',
  'Manuel Macedo': 'equipo-manolo-macedo',
  'Estefania Lara': 'equipo-estefania-lara',
}

export const LEGACY_EVENT_COVERS: Record<string, string> = {
  'feria-contract': 'evento-1',
  'webinar-iluminacion': 'evento-2',
  'lanzamiento-collection': 'evento-3',
  'showroom-abierto': 'evento-1',
  'feria-industrial': 'evento-2',
  'webinar-disenio': 'evento-3',
  'lanzamiento-premium': 'evento-1',
}

export const LEGACY_EVENT_GALLERY = [
  'images/eventos/evento-2.webp',
  'images/eventos/evento-3.webp',
  'images/eventos/evento-1.webp',
  'images/productos/producto-1.webp',
  'images/productos/producto-2.webp',
  'images/productos/producto-3.webp',
]

export const LEGACY_BUSINESS_LINE_COVERS: Record<string, string> = {
  furniture: 'area-workspace',
  specialty: 'area-specialty',
  lighting: 'area-lighting',
}

export const LEGACY_SECTOR_COVERS: Record<string, string> = {
  workspace: 'area-workspace',
  hospitality: 'area-hospitality',
  retail: 'area-commerce-retail',
}

export const LEGACY_BRAND_SLUGS = [
  'allermuir', 'allsteel', 'andreu-world', 'bolon', 'brokis', 'delta-light', 'flos', 'fritz-hansen',
  'kriskadecor', 'luft', 'occhio', 'parachilna', 'the-senator-group', 'targetti', 'unifor', 'vitra',
]

export const LEGACY_PROJECT_SLUGS = ['entretenimiento-digital', 'ecommerce', 'hyundai', 'ios', 'isuzu', 'technology-center']

/** Placeholder product cards shown on the home until the catalog has featured products. */
export const LEGACY_PRODUCTS = [
  ['Smart Conference', 'WORKSPACE'], ['Float Gather', 'WORKSPACE'], ['Float Micro', 'SPECIALTY'], ['Silla Path Alta', 'WORKSPACE'],
  ['Lounge Soft', 'HOSPITALITY'], ['Occhio Sento', 'LIGHTING'], ['Kris Cadena', 'SPECIALTY'], ['Vitra Eames Chair', 'WORKSPACE'],
  ['Fritz Chair', 'HOSPITALITY'], ['Allermuir Loop', 'WORKSPACE'], ['Brokis Globe', 'LIGHTING'], ['Delta Focus', 'LIGHTING'],
  ['Unifor System', 'WORKSPACE'], ['Andreu World Stool', 'HOSPITALITY'], ['Parachilna Aro', 'LIGHTING'], ['Targetti Slim', 'LIGHTING'],
].map(([name, category], i) => ({ name, category, image: `images/productos/producto-${(i % 4) + 1}.webp` }))

export const LEGACY_CONTACT_IMAGE = 'images/contacto/contacto.webp'
export const LEGACY_HERO_VIDEO = 'video/hero.mp4'

const url = (file: string) => `/${file}`

/** Public URL of the pre-media-library file for an entity, if one exists. */
export const legacyMedia = {
  brandLogo: (slug: string) => (LEGACY_BRAND_SLUGS.includes(slug) ? url(`images/marcas/marca-${slug}.png`) : null),
  teamPhoto: (fullName: string) => (LEGACY_TEAM_FILES[fullName] ? url(`images/equipo/${LEGACY_TEAM_FILES[fullName]}.png`) : null),
  projectCover: (slug: string) => (LEGACY_PROJECT_SLUGS.includes(slug) ? url(`images/proyectos/proyecto-${slug}.webp`) : null),
  eventCover: (slug: string) => (LEGACY_EVENT_COVERS[slug] ? url(`images/eventos/${LEGACY_EVENT_COVERS[slug]}.webp`) : null),
  eventGallery: () => LEGACY_EVENT_GALLERY.map(url),
  businessLineCover: (slug: string) => (LEGACY_BUSINESS_LINE_COVERS[slug] ? url(`images/areas/${LEGACY_BUSINESS_LINE_COVERS[slug]}.webp`) : null),
  sectorCover: (slug: string) => (LEGACY_SECTOR_COVERS[slug] ? url(`images/areas/${LEGACY_SECTOR_COVERS[slug]}.webp`) : null),
  contactImage: () => url(LEGACY_CONTACT_IMAGE),
  heroVideo: () => url(LEGACY_HERO_VIDEO),
}
