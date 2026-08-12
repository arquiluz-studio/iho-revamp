export type EventType = 'EVENTO' | 'LANZAMIENTO' | 'FERIA' | 'WEBINAR'

export type IhoEvent = {
  slug: string
  day: string
  month: string
  city: string
  type: EventType
  title: string
  meta: string
  image: string
  date: string          // ISO — past/future is computed from this, never stored as boolean
  fullDate: string      // 'Viernes 14 de agosto, 2026'
  timeRange: string     // '6:00 PM — 10:00 PM'
  venue: string         // 'Showroom IHO · Polanco, CDMX'
  access: string
  description: string[]
  itinerary: { num: string; text: string }[]
}

export type Product = { name: string; image: string; category: string }

export function isPast(ev: IhoEvent): boolean {
  return new Date(ev.date) < new Date()
}

export function firstUpcomingIndex(events: IhoEvent[]): number {
  const i = events.findIndex(e => !isPast(e))
  return i === -1 ? events.length - 1 : i
}

const MONTHS_ES = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC']

export function todayLabel(): string {
  const n = new Date()
  return `${n.getDate()} ${MONTHS_ES[n.getMonth()]}`
}

export const EVENTS: IhoEvent[] = [
  {
    slug: 'feria-contract',
    day: '20', month: 'MAY', city: 'GDL',
    type: 'FERIA',
    title: 'Contract Fair 2026',
    meta: '20 MAY · GUADALAJARA · 10:00 AM',
    image: '/images/eventos/evento-1.webp',
    date: '2026-05-20T10:00:00',
    fullDate: 'Martes 20 de mayo, 2026',
    timeRange: '10:00 AM — 6:00 PM',
    venue: 'Expo Guadalajara · Guadalajara, Jalisco',
    access: 'Entrada libre con registro',
    description: [
      'El Contract Fair 2026 reúne a los principales proveedores de mobiliario e interiorismo para proyectos corporativos, hoteleros y de retail en México y Latinoamérica.',
      'IHO presenta en este espacio sus más recientes colecciones y el catálogo de marcas internacionales que distribuye en la región.',
    ],
    itinerary: [
      { num: '01', text: 'Apertura del pabellón IHO y presentación de novedades' },
      { num: '02', text: 'Demostración de sistemas de mobiliario corporativo' },
      { num: '03', text: 'Sesión con especialistas de producto' },
      { num: '04', text: 'Cierre y networking' },
    ],
  },
  {
    slug: 'webinar-iluminacion',
    day: '11', month: 'JUN', city: 'EN LÍNEA',
    type: 'WEBINAR',
    title: 'Webinar Iluminación',
    meta: '11 JUN · EN LÍNEA · 5:00 PM',
    image: '/images/eventos/evento-2.webp',
    date: '2026-06-11T17:00:00',
    fullDate: 'Jueves 11 de junio, 2026',
    timeRange: '5:00 PM — 6:30 PM',
    venue: 'En línea · Plataforma Zoom',
    access: 'Acceso libre con registro previo',
    description: [
      'Un webinar técnico sobre tendencias en iluminación arquitectónica, con foco en eficiencia energética y diseño de experiencias lumínicas para espacios corporativos y comerciales.',
      'Presentado por especialistas de IHO Lighting y representantes de marcas como FLOS, Occhio y Delta Light.',
    ],
    itinerary: [
      { num: '01', text: 'Introducción y tendencias globales de iluminación' },
      { num: '02', text: 'Casos de estudio: proyectos recientes de IHO' },
      { num: '03', text: 'Presentación de nuevas colecciones' },
      { num: '04', text: 'Ronda de preguntas' },
    ],
  },
  {
    slug: 'lanzamiento-collection',
    day: '28', month: 'JUL', city: 'CDMX',
    type: 'LANZAMIENTO',
    title: 'Collection IHO',
    meta: '28 JUL · CDMX, MÉXICO · 7:00 PM',
    image: '/images/eventos/evento-3.webp',
    date: '2026-07-28T19:00:00',
    fullDate: 'Martes 28 de julio, 2026',
    timeRange: '7:00 PM — 10:00 PM',
    venue: 'Showroom IHO · Polanco, CDMX',
    access: 'Solo invitados',
    description: [
      'El lanzamiento de la Collection IHO 2026 presentó las piezas que definirán el interiorismo de alta gama en la región durante los próximos meses.',
      'Una noche íntima para clientes, arquitectos y diseñadores con acceso anticipado al catálogo completo.',
    ],
    itinerary: [
      { num: '01', text: 'Coctel de bienvenida' },
      { num: '02', text: 'Presentación de la Collection IHO 2026' },
      { num: '03', text: 'Recorrido por el showroom' },
      { num: '04', text: 'Networking y cierre' },
    ],
  },
  {
    slug: 'showroom-abierto',
    day: '14', month: 'AGO', city: 'CDMX',
    type: 'EVENTO',
    title: 'Showroom abierto',
    meta: '14 AGO · CDMX, MÉXICO · 6:00 PM',
    image: '/images/eventos/evento-1.webp',
    date: '2026-08-14T18:00:00',
    fullDate: 'Viernes 14 de agosto, 2026',
    timeRange: '6:00 PM — 10:00 PM',
    venue: 'Showroom IHO · Polanco, CDMX',
    access: 'Cortesía con registro previo',
    description: [
      'Una noche pensada para conocer de cerca las últimas piezas y colecciones disponibles en el showroom de IHO. Recorre los espacios con guías especializados y descubre las marcas que definen el diseño de interiores en LATAM.',
      'El acceso es sin costo con registro previo. Los lugares son limitados. La confirmación llega por correo en un máximo de 48 horas.',
    ],
    itinerary: [
      { num: '01', text: 'Bienvenida y presentación del showroom' },
      { num: '02', text: 'Recorrido guiado por las colecciones destacadas' },
      { num: '03', text: 'Sesión con especialistas de producto' },
      { num: '04', text: 'Networking y cierre' },
    ],
  },
  {
    slug: 'feria-industrial',
    day: '02', month: 'SEP', city: 'MTY',
    type: 'FERIA',
    title: 'Feria Industrial',
    meta: '02 SEP · MONTERREY · 10:00 AM',
    image: '/images/eventos/evento-2.webp',
    date: '2026-09-02T10:00:00',
    fullDate: 'Miércoles 2 de septiembre, 2026',
    timeRange: '10:00 AM — 6:00 PM',
    venue: 'Cintermex · Monterrey, Nuevo León',
    access: 'Entrada libre con registro',
    description: [
      'La Feria Industrial de Monterrey es el punto de encuentro del sector corporativo e industrial del norte del país, donde IHO presentará soluciones integrales para oficinas, plantas y centros de distribución.',
      'Visita el stand de IHO para conocer el portafolio completo de marcas y servicios disponibles en la región.',
    ],
    itinerary: [
      { num: '01', text: 'Apertura y presentación del stand IHO' },
      { num: '02', text: 'Demostración de productos para espacios industriales' },
      { num: '03', text: 'Reuniones one-to-one con especialistas' },
      { num: '04', text: 'Cierre y networking' },
    ],
  },
  {
    slug: 'webinar-disenio',
    day: '21', month: 'SEP', city: 'EN LÍNEA',
    type: 'WEBINAR',
    title: 'Diseño de interiores',
    meta: '21 SEP · EN LÍNEA · 5:00 PM',
    image: '/images/eventos/evento-3.webp',
    date: '2026-09-21T17:00:00',
    fullDate: 'Lunes 21 de septiembre, 2026',
    timeRange: '5:00 PM — 6:30 PM',
    venue: 'En línea · Plataforma Zoom',
    access: 'Acceso libre con registro previo',
    description: [
      'Un recorrido por las principales tendencias en diseño de interiores para espacios de trabajo, con énfasis en bienestar, sustentabilidad y tecnología integrada.',
      'Ponentes de IHO Workspace comparten casos reales de proyectos en México y Centroamérica.',
    ],
    itinerary: [
      { num: '01', text: 'Tendencias globales en workplace design' },
      { num: '02', text: 'Casos de estudio: bienestar en la oficina' },
      { num: '03', text: 'Novedades del catálogo IHO 2026' },
      { num: '04', text: 'Ronda de preguntas' },
    ],
  },
  {
    slug: 'lanzamiento-premium',
    day: '15', month: 'OCT', city: 'CDMX',
    type: 'LANZAMIENTO',
    title: 'Lanzamiento Premium',
    meta: '15 OCT · CDMX, MÉXICO · 7:00 PM',
    image: '/images/eventos/evento-1.webp',
    date: '2026-10-15T19:00:00',
    fullDate: 'Jueves 15 de octubre, 2026',
    timeRange: '7:00 PM — 10:00 PM',
    venue: 'Showroom IHO · Polanco, CDMX',
    access: 'Solo invitados',
    description: [
      'El evento premium de cierre de año de IHO, donde se presentarán las piezas más exclusivas del catálogo 2027 ante un selecto grupo de arquitectos, diseñadores y clientes de alto nivel.',
      'Una noche de diseño, exclusividad y networking en el showroom de Polanco.',
    ],
    itinerary: [
      { num: '01', text: 'Coctel de bienvenida con música en vivo' },
      { num: '02', text: 'Presentación de la colección premium 2027' },
      { num: '03', text: 'Recorrido guiado con los directores de IHO' },
      { num: '04', text: 'Cena y cierre' },
    ],
  },
]

const P = (n: number): string => `/images/productos/producto-${((n - 1) % 4) + 1}.webp`

export const PRODUCTS: Product[] = [
  { name: 'Smart Conference', image: P(1), category: 'WORKSPACE' },
  { name: 'Float Gather', image: P(2), category: 'WORKSPACE' },
  { name: 'Float Micro', image: P(3), category: 'SPECIALTY' },
  { name: 'Silla Path Alta', image: P(4), category: 'WORKSPACE' },
  { name: 'Lounge Soft', image: P(1), category: 'HOSPITALITY' },
  { name: 'Occhio Sento', image: P(2), category: 'LIGHTING' },
  { name: 'Kris Cadena', image: P(3), category: 'SPECIALTY' },
  { name: 'Vitra Eames Chair', image: P(4), category: 'WORKSPACE' },
  { name: 'Fritz Chair', image: P(1), category: 'HOSPITALITY' },
  { name: 'Allermuir Loop', image: P(2), category: 'WORKSPACE' },
  { name: 'Brokis Globe', image: P(3), category: 'LIGHTING' },
  { name: 'Delta Focus', image: P(4), category: 'LIGHTING' },
  { name: 'Unifor System', image: P(1), category: 'WORKSPACE' },
  { name: 'Andreu World Stool', image: P(2), category: 'HOSPITALITY' },
  { name: 'Parachilna Aro', image: P(3), category: 'LIGHTING' },
  { name: 'Targetti Slim', image: P(4), category: 'LIGHTING' },
]

export const GALLERY_IMAGES: string[] = [
  '/images/eventos/evento-2.webp',
  '/images/eventos/evento-3.webp',
  '/images/eventos/evento-1.webp',
  '/images/productos/producto-1.webp',
  '/images/productos/producto-2.webp',
  '/images/eventos/evento-2.webp',
  '/images/productos/producto-3.webp',
]
