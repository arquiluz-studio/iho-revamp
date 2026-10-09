// Static content used until the site reads from Supabase.
import { EVENTS, PRODUCTS, GALLERY_IMAGES, isPast } from '@/app/data'
import type { EventDetailVM, EventVM, HomeVM, ProductCardVM } from '@/lib/types/site'

const img = (src: string, alt: string) => ({ src, alt })

const BRANDS = [
  { slug: 'allermuir', name: 'Allermuir' }, { slug: 'allsteel', name: 'Allsteel' },
  { slug: 'andreu-world', name: 'Andreu World', thin: true }, { slug: 'bolon', name: 'BOLON' },
  { slug: 'brokis', name: 'BROKIS' }, { slug: 'delta-light', name: 'DELTA LIGHT' },
  { slug: 'flos', name: 'FLOS' }, { slug: 'fritz-hansen', name: 'FRITZ HANSEN', thin: true },
  { slug: 'kriskadecor', name: 'kriskadecor', thin: true }, { slug: 'luft', name: 'Luft' },
  { slug: 'occhio', name: 'Occhio' }, { slug: 'parachilna', name: 'PARACHILNA', thin: true },
  { slug: 'the-senator-group', name: 'The Senator Group', thin: true }, { slug: 'targetti', name: 'TARGETTI' },
  { slug: 'unifor', name: 'UniFor' }, { slug: 'vitra', name: 'Vitra' },
]

const TEAM = [
  { slug: 'salvador-miranda', name: 'Salvador Miranda', role: 'CEO', pos: '0% 0%' },
  { slug: 'daniela-garcia', name: 'Daniela García', role: 'Regional Workspace Director', pos: '0% 9.5%' },
  { slug: 'lupina-cornejo', name: 'Lupina Cornejo', role: 'Comercial Director, Ciento Once', pos: '0% 0%' },
  { slug: 'manolo-macedo', name: 'Manuel Macedo', role: 'Lighting Director', pos: '0% 0%' },
  { slug: 'estefania-lara', name: 'Estefania Lara', role: 'Flooring Manager', pos: '0% 9.5%' },
]

const OFFICES = [
  { city: 'CIUDAD DE MÉXICO', address: 'Juan Vazquez de Mella 481-Primer Piso, Polanco, Miguel Hidalgo, 11550, CDMX.' },
  { city: 'MONTERREY', address: 'Calz. del Valle 111, Del Valle, 66220 San Pedro Garza García, Nuevo León.' },
  { city: 'GUADALAJARA', address: 'Torre Patria Hipódromo. Av. Patria 1721, Planta Baja. Col. Colomos Providencia, C.P. 44660 Guadalajara, Jalisco.' },
  { city: 'CD. JUÁREZ', address: 'Antonio J. Bermúdez 2151-Local 7, Parque Industrial Antonio J Bermúdez, 32400 Cd Juárez, Chih.' },
  { city: 'TIJUANA', address: 'Av. Baños de Agua Caliente 3780, 20 de Noviembre, 22100 Tijuana, B.C.' },
  { city: 'CHIHUAHUA', address: 'Distrito 1, Via Citadela 5701 Edificio Quorum Oficina 301-302, Distrito 1, 31110 Chihuahua, Chih.' },
  { city: 'PANAMÁ', address: 'Ph Dream Plaza, Av. Centenario, Panamá.', muted: true },
  { city: 'COSTA RICA', address: 'Avenida Escazú, AE 205, Piso 2. Escazú, San José. Costa Rica.', muted: true },
  { city: 'GUATEMALA', address: '3ra. Avenida 10-80 Zona 10, Edificio Forum Zona Viva, Torre 2, Oficina 1004, Guatemala.', muted: true },
]

const AREAS = [
  { num: '01', slug: 'workspace', img: '/images/areas/area-workspace.webp', title: 'Workspace', desc: 'Mobiliario y diseño integral para oficinas corporativas.' },
  { num: '02', slug: 'specialty', img: '/images/areas/area-specialty.webp', title: 'Specialty', desc: 'Productos y soluciones especiales para proyectos exigentes.' },
  { num: '03', slug: 'lighting', img: '/images/areas/area-lighting.webp', title: 'Lighting', desc: 'Diseño y soluciones de iluminación arquitectónica para cada espacio.' },
  { num: '04', slug: 'hospitality', img: '/images/areas/area-hospitality.webp', title: 'Hospitality', desc: 'Ambientes para hoteles, restaurantes y espacios de servicio.' },
  { num: '05', slug: 'retail', img: '/images/areas/area-commerce-retail.webp', title: 'Commerce & Retail', desc: 'Experiencias de marca para espacios comerciales y retail.' },
]

const PROJECTS = [
  { slug: 'entretenimiento-digital', img: '/images/proyectos/proyecto-entretenimiento-digital.webp', title: 'EMPRESA DE ENTRETENIMIENTO DIGITAL', desc: 'Equipamiento integral de un espacio dinámico y vanguardista.' },
  { slug: 'ecommerce', img: '/images/proyectos/proyecto-ecommerce.webp', title: 'EMPRESA DE E-COMMERCE', desc: 'Un proyecto con identidad cultural única.' },
  { slug: 'hyundai', img: '/images/proyectos/proyecto-hyundai.webp', title: 'HYUNDAI', desc: 'Se transformó el espacio con ingeniería acústica personalizada y acabados premium.' },
  { slug: 'ios', img: '/images/proyectos/proyecto-ios.webp', title: 'IOS', desc: 'Espacio contemporáneo disruptivo con mobiliario de alta gama.' },
  { slug: 'isuzu', img: '/images/proyectos/proyecto-isuzu.webp', title: 'ISUZU', desc: 'Diseño minimalista de estética japonesa y alta funcionalidad.' },
  { slug: 'technology-center', img: '/images/proyectos/proyecto-technology-center.webp', title: 'TECHNOLOGY CENTER', desc: 'Un hub funcional y tecnológico diseñado para impulsar la innovación.' },
]

export type StaticPaths = {
  event: (slug: string) => string
  products: string
}

function toEventVM(e: (typeof EVENTS)[number], paths: StaticPaths): EventVM {
  return {
    slug: e.slug,
    href: paths.event(e.slug),
    startsAt: e.date,
    isPast: isPast(e),
    day: e.day,
    month: e.month,
    city: e.city,
    typeLabel: e.type,
    title: e.title,
    meta: e.meta,
    image: img(e.image, e.title),
  }
}

function staticProducts(href: string): ProductCardVM[] {
  return PRODUCTS.map((p, i) => ({ key: `p${i}`, name: p.name, image: img(p.image, p.name), category: p.category, href }))
}

export function getStaticHome(paths: StaticPaths): HomeVM {
  return {
    hero: { eyebrow: 'EST. 1992 · LATINOAMÉRICA', title: 'TODO EL PROYECTO,\n*UN SOLO* PROVEEDOR.', videoSrc: '/video/hero.mp4' },
    sectors: ['CORPORATIVO', 'INDUSTRIAL', 'COMERCIAL', 'RESIDENCIAL', 'HOTELERÍA', 'EDUCACIÓN'],
    products: staticProducts(paths.products),
    events: EVENTS.map(e => toEventVM(e, paths)),
    group: {
      stats: [
        { value: 35, prefix: '+', suffix: '', label: 'Años de\nexperiencia' },
        { value: 17, prefix: '', suffix: 'M', label: 'm²\ninstalados' },
        { value: 5, prefix: '', suffix: '', label: 'Áreas de\nnegocio' },
        { value: 4, prefix: '', suffix: '', label: 'Países en\nLATAM' },
      ],
      mapCountries: [
        { code: 'mx', name: 'México', cities: ['CDMX', 'Cd. Juárez', 'Chihuahua', 'Guadalajara', 'Monterrey', 'Tijuana'], isCurrent: true, hasSite: true },
        { code: 'gt', name: 'Guatemala', cities: ['Guatemala'], isCurrent: false, hasSite: true },
        { code: 'cr', name: 'Costa Rica', cities: ['Costa Rica'], isCurrent: false, hasSite: true },
        { code: 'pa', name: 'Panamá', cities: ['Panamá'], isCurrent: false, hasSite: true },
      ],
    },
    areas: AREAS.map(a => ({ num: a.num, title: a.title, description: a.desc, image: img(a.img, a.title), href: '#areas' })),
    projects: PROJECTS.map(p => ({ key: p.slug, title: p.title, description: p.desc, image: img(p.img, p.title) })),
    brands: BRANDS.map(b => ({ slug: b.slug, name: b.name, thin: b.thin, logo: img(`/images/marcas/marca-${b.slug}.png`, b.name) })),
    team: TEAM.map(m => ({ name: m.name, role: m.role, objectPosition: m.pos, linkedinUrl: null, photo: img(`/images/equipo/equipo-${m.slug}.png`, m.name) })),
    offices: OFFICES,
    contactImage: img('/images/contacto/contacto.webp', 'Contacto IHO'),
  }
}

export function getStaticEvent(slug: string, paths: StaticPaths): EventDetailVM | null {
  const e = EVENTS.find(x => x.slug === slug)
  if (!e) return null
  return {
    ...toEventVM(e, paths),
    fullDate: e.fullDate,
    timeRange: e.timeRange,
    venue: e.venue,
    access: e.access,
    locationLine: `${e.fullDate.toUpperCase()} · ${e.city}, MÉXICO · ${e.timeRange.split(' — ')[0]}`,
    description: e.description,
    agenda: e.itinerary,
    gallery: GALLERY_IMAGES.map((src, i) => img(src, `Galería ${i + 1}`)),
    brands: [],
    products: staticProducts('#productos'),
    registration: { enabled: !isPast(e), closed: false },
  }
}

export function getStaticEventSlugs(): string[] {
  return EVENTS.map(e => e.slug)
}
