'use client'
import { useEffect, useRef, useState } from 'react'

const ACUMIN = '"Acumin Variable Condensed", "Acumin Pro Condensed", "Saira Condensed", sans-serif'
const ARROW = 'M14.9922 0.907227C15.5854 0.343852 16.5108 0.355639 17.1152 1.00195L17.124 1.01074L17.1318 1.02051L25.1328 10.4727L25.1484 10.4922L25.1631 10.5127C25.3539 10.7913 25.4917 11.1077 25.5 11.4648C25.5084 11.8252 25.3839 12.1656 25.1641 12.4883L25.1494 12.5098L25.1328 12.5293L17.1318 21.9814L17.1289 21.9854C16.64 22.5526 15.7236 22.6944 15.1006 22.1924L14.9805 22.084C14.6941 21.7942 14.5482 21.4033 14.5283 21.0264C14.5084 20.6492 14.6124 20.2394 14.8867 19.9209L20.7031 13.0518H2C1.14833 13.0517 0.5 12.3342 0.5 11.501C0.500069 10.6678 1.14836 9.95119 2 9.95117H20.7031L14.8867 3.08008V3.08105C14.614 2.76423 14.5066 2.35345 14.5244 1.97461C14.5423 1.59564 14.6884 1.1958 14.9922 0.907227Z'

const EVENTS = [
  { img: '/images/eventos/evento-1.webp', day: '14', month: 'AGO · CDMX', title: 'Showroom abierto', badge: 'SAVE THE DATE', meta: '14 AGO · CDMX, MÉXICO · 6:00 PM' },
  { img: '/images/eventos/evento-2.webp', day: '02', month: 'SEP', title: 'Feria industrial', badge: '02 SEP', meta: '02 SEP · MONTERREY, MÉXICO · 10:00 AM' },
  { img: '/images/eventos/evento-3.webp', day: '21', month: 'SEP', title: 'Webinar iluminación', badge: '21 SEP', meta: '21 SEP · EN LÍNEA · 5:00 PM' },
]

const PRODUCTS = [
  { img: '/images/productos/producto-1.webp', name: 'Smart Conference' },
  { img: '/images/productos/producto-2.webp', name: 'Float Gather' },
  { img: '/images/productos/producto-3.webp', name: 'Float Micro' },
  { img: '/images/productos/producto-4.webp', name: 'Silla de escritorio alta Path' },
]

const BRANDS = [
  { slug: 'allermuir', alt: 'Allermuir' }, { slug: 'allsteel', alt: 'Allsteel' },
  { slug: 'andreu-world', alt: 'Andreu World', thin: true }, { slug: 'bolon', alt: 'BOLON' },
  { slug: 'brokis', alt: 'BROKIS' }, { slug: 'delta-light', alt: 'DELTA LIGHT' },
  { slug: 'flos', alt: 'FLOS' }, { slug: 'fritz-hansen', alt: 'FRITZ HANSEN', thin: true },
  { slug: 'kriskadecor', alt: 'kriskadecor', thin: true }, { slug: 'luft', alt: 'Luft' },
  { slug: 'occhio', alt: 'Occhio' }, { slug: 'parachilna', alt: 'PARACHILNA', thin: true },
  { slug: 'the-senator-group', alt: 'The Senator Group', thin: true }, { slug: 'targetti', alt: 'TARGETTI' },
  { slug: 'unifor', alt: 'UniFor' }, { slug: 'vitra', alt: 'Vitra' },
] as { slug: string; alt: string; thin?: boolean }[]

const TEAM = [
  { img: '/images/equipo/equipo-salvador-miranda.png', name: 'Salvador Miranda', role: 'CEO', pos: '0% 0%' },
  { img: '/images/equipo/equipo-daniela-garcia.png', name: 'Daniela García', role: 'Regional Workspace Director', pos: '0% 9.5%' },
  { img: '/images/equipo/equipo-lupina-cornejo.png', name: 'Lupina Cornejo', role: 'Comercial Director, Ciento Once', pos: '0% 0%' },
  { img: '/images/equipo/equipo-manolo-macedo.png', name: 'Manuel Macedo', role: 'Lighting Director', pos: '0% 0%' },
  { img: '/images/equipo/equipo-estefania-lara.png', name: 'Estefania Lara', role: 'Flooring Manager', pos: '0% 9.5%' },
]

const ADDRESSES = [
  { city: 'CIUDAD DE MÉXICO', addr: 'Juan Vazquez de Mella 481-Primer Piso, Polanco, Miguel Hidalgo, 11550, CDMX.' },
  { city: 'MONTERREY', addr: 'Calz. del Valle 111, Del Valle, 66220 San Pedro Garza García, Nuevo León.' },
  { city: 'GUADALAJARA', addr: 'Torre Patria Hipódromo. Av. Patria 1721, Planta Baja. Col. Colomos Providencia, C.P. 44660 Guadalajara, Jalisco.' },
  { city: 'CD. JUÁREZ', addr: 'Antonio J. Bermúdez 2151-Local 7, Parque Industrial Antonio J Bermúdez, 32400 Cd Juárez, Chih.' },
  { city: 'TIJUANA', addr: 'Av. Baños de Agua Caliente 3780, 20 de Noviembre, 22100 Tijuana, B.C.' },
  { city: 'CHIHUAHUA', addr: 'Distrito 1, Via Citadela 5701 Edificio Quorum Oficina 301-302, Distrito 1, 31110 Chihuahua, Chih.' },
  { city: 'PANAMÁ', addr: 'Ph Dream Plaza, Av. Centenario, Panamá.', muted: true },
  { city: 'COSTA RICA', addr: 'Avenida Escazú, AE 205, Piso 2. Escazú, San José. Costa Rica.', muted: true },
  { city: 'GUATEMALA', addr: '3ra. Avenida 10-80 Zona 10, Edificio Forum Zona Viva, Torre 2, Oficina 1004, Guatemala.', muted: true },
] as { city: string; addr: string; muted?: boolean }[]

// ── Small components ──

const Arr = ({ w = 17, h = 15, flip = false }: { w?: number; h?: number; flip?: boolean }) => (
  <svg viewBox="0 0 26 23" width={w} height={h} fill="currentColor" style={{ display: 'block', flex: 'none', transform: flip ? 'scaleX(-1)' : 'none' }}>
    <path d={ARROW} />
  </svg>
)

const RoundBtn = ({ onClick, flip = false, size = 46, border = '1px solid rgba(20,18,12,0.2)', bg = 'transparent', color = '#17150f', arrowSize = 16 }: { onClick: () => void; flip?: boolean; size?: number; border?: string; bg?: string; color?: string; arrowSize?: number }) => (
  <button onClick={onClick} aria-label={flip ? 'Anterior' : 'Siguiente'} style={{ width: size, height: size, borderRadius: '50%', border, background: bg, color, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Arr w={arrowSize} h={arrowSize - 2} flip={flip} />
  </button>
)

const IhoBtn = ({ href, children, style }: { href: string; children: React.ReactNode; style?: React.CSSProperties }) => (
  <a href={href} className="iho-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#ef483d', color: '#fff', padding: '14px 26px', borderRadius: 32, fontFamily: '"Source Sans 3", sans-serif', fontWeight: 600, fontSize: 15, ...style }}>
    {children}
    <span className="iho-arrow" style={{ display: 'inline-flex', alignItems: 'center' }}><Arr /></span>
  </a>
)

const SLabel = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 12, letterSpacing: '1.5px', color: '#ef483d', marginBottom: 18, ...style }}>{children}</div>
)

const SH2 = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <h2 style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: 50, lineHeight: 0.98, letterSpacing: '-0.5px', textTransform: 'uppercase', margin: '0 0 18px', ...style }}>{children}</h2>
)

const LinkedInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="#17150F">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
  </svg>
)

const Switch = ({ active }: { active: 'home' | 'a' | 'b' }) => (
  <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 200, display: 'flex', gap: 4, background: '#17150f', padding: 6, borderRadius: 40, boxShadow: '0 10px 34px rgba(0,0,0,0.3)' }}>
    {([
      { href: '/', label: 'ACTUAL', key: 'home' },
      { href: '/propuesta-a', label: 'A · VIDEO', key: 'a' },
      { href: '/propuesta-b', label: 'B · SLIDER', key: 'b' },
    ] as const).map(item => (
      <a key={item.key} href={item.href} style={{ display: 'flex', alignItems: 'center', padding: '9px 18px', borderRadius: 30, background: item.key === active ? '#ef483d' : 'transparent', color: item.key === active ? '#fff' : 'rgba(255,255,255,0.62)', fontFamily: '"Space Mono", monospace', fontSize: 11, letterSpacing: '1.2px' }}>{item.label}</a>
    ))}
  </div>
)

export default function PropuestaA() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [evIdx, setEvIdx] = useState(0)
  const prodTrackRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const areasRef = useRef<HTMLDivElement>(null)
  const projRef = useRef<HTMLDivElement>(null)

  // Header transparency
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > window.innerHeight * 0.75)
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  // Events auto-advance
  useEffect(() => {
    const t = setInterval(() => setEvIdx(i => (i + 1) % 3), 7000)
    return () => clearInterval(t)
  }, [])

  // Counter animation
  useEffect(() => {
    const el = statsRef.current
    if (!el) return
    const specs = [{ v: 35, p: '+', s: '' }, { v: 17, p: '', s: 'M' }, { v: 5, p: '', s: '' }, { v: 4, p: '', s: '' }]
    let done = false
    const run = () => {
      if (done) return; done = true
      el.querySelectorAll('.iho-counter').forEach((counter, idx) => {
        const c = specs[idx]; if (!c) return
        const t0 = performance.now()
        const tick = (now: number) => {
          const t = Math.min((now - t0) / 1800, 1)
          counter.textContent = c.p + Math.round((1 - Math.pow(1 - t, 3)) * c.v) + c.s
          if (t < 1) requestAnimationFrame(tick)
        }
        counter.textContent = c.p + '0' + c.s
        requestAnimationFrame(tick)
      })
    }
    const obs = new IntersectionObserver(e => { if (e[0].isIntersecting) run() }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Card stagger
  useEffect(() => {
    for (const [ref, delay] of [[areasRef, 120], [projRef, 100]] as const) {
      const grid = ref.current
      if (!grid) continue
      let seen = false
      const cards = Array.from(grid.children)
      const obs = new IntersectionObserver(e => {
        if (seen || !e[0].isIntersecting) return; seen = true; obs.disconnect()
        cards.forEach((c, i) => setTimeout(() => c.classList.add('is-visible'), i * delay))
      }, { threshold: 0.08 })
      obs.observe(grid)
    }
  }, [])

  const navColor = menuOpen || scrolled ? '#2c2920' : '#ffffff'

  const prodStep = () => Math.max(240, (prodTrackRef.current?.clientWidth ?? 960) / 4)

  return (
    <>
      <Switch active="a" />
      <div style={{ width: '100%', overflowX: 'hidden' }}>

        {/* ── HEADER ── */}
        <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60, background: scrolled ? '#faf7f1' : 'transparent', borderBottom: `1px solid ${scrolled ? 'rgba(20,18,12,0.08)' : 'rgba(255,255,255,0.14)'}`, transition: 'background 0.4s ease, border-color 0.4s ease' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '18px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <img src={scrolled ? '/images/logo-iho-black.png' : '/images/logo-iho-white.png'} alt="IHO" style={{ height: 36, display: 'block' }} />
            </div>
            <nav className={menuOpen ? 'iho-nav-open' : ''} style={{ display: 'flex', alignItems: 'center', gap: 34, fontFamily: '"Source Sans 3", sans-serif', fontSize: 15, fontWeight: 500, color: navColor }}>
              <a href="#grupo" className="iho-nav-link" onClick={() => setMenuOpen(false)}>Grupo IHO</a>
              <a href="#areas" className="iho-nav-link" onClick={() => setMenuOpen(false)}>Áreas</a>
              <a href="#proyectos" className="iho-nav-link" onClick={() => setMenuOpen(false)}>Proyectos</a>
              <a href="#marcas" className="iho-nav-link" onClick={() => setMenuOpen(false)}>Marcas</a>
              <a href="#contacto" className="iho-btn" onClick={() => setMenuOpen(false)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#ef483d', color: '#fff', padding: '10px 20px', borderRadius: 30, fontWeight: 600 }}>
                Contactar
                <span className="iho-arrow" style={{ display: 'inline-flex', alignItems: 'center' }}><Arr w={15} h={13} /></span>
              </a>
            </nav>
            <button id="iho-menu-btn" className={menuOpen ? 'is-open' : ''} aria-label="Menú" aria-expanded={menuOpen} onClick={() => setMenuOpen(o => !o)}>
              <span /><span /><span />
            </button>
          </div>
        </header>

        {/* ── HERO VIDEO ── */}
        <section style={{ position: 'relative', height: '100vh', minHeight: 640, width: '100%', overflow: 'hidden', background: '#0e0e0e' }}>
          <video autoPlay muted loop playsInline preload="auto" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}>
            <source src="/video/hero.mp4" type="video/mp4" />
          </video>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(8,8,8,0.8) 0%, rgba(8,8,8,0.5) 42%, rgba(8,8,8,0.08) 74%, rgba(8,8,8,0) 100%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(8,8,8,0.6) 0%, rgba(8,8,8,0) 26%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <div className="iho-hero-overlay" style={{ maxWidth: 1240, height: '100%', margin: '0 auto', padding: '0 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 13, letterSpacing: '2.5px', color: 'rgba(255,255,255,0.85)', marginBottom: 26 }}>EST. 1992 · LATINOAMÉRICA</div>
              <h1 style={{ fontFamily: ACUMIN, fontWeight: 800, color: '#fff', fontSize: 88, lineHeight: 0.9, letterSpacing: '-1px', margin: '0 0 36px', textTransform: 'uppercase' }}>
                TODO EL PROYECTO,<br /><span style={{ color: '#ef483d' }}>UN SOLO</span> PROVEEDOR.
              </h1>
              <a href="#contacto" className="iho-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#ef483d', color: '#fff', padding: '14px 26px', borderRadius: 32, fontFamily: '"Source Sans 3", sans-serif', fontWeight: 600, fontSize: 15, pointerEvents: 'auto', alignSelf: 'flex-start' }}>
                Cuéntanos tu proyecto
                <span className="iho-arrow" style={{ display: 'inline-flex', alignItems: 'center' }}><Arr /></span>
              </a>
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 34, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, pointerEvents: 'none' }}>
            <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, letterSpacing: '2px', color: 'rgba(255,255,255,0.6)' }}>DESLIZA</div>
            <div style={{ width: 1, height: 44, background: 'linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 100%)' }} />
          </div>
        </section>

        {/* ── INDUSTRY STRIP ── */}
        <div style={{ borderTop: '1px solid rgba(20,18,12,0.1)', borderBottom: '1px solid rgba(20,18,12,0.1)' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '18px 40px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, fontFamily: '"Space Mono", monospace', fontSize: 12, letterSpacing: '1.5px', color: '#8a8478', backgroundColor: '#ffffff' }}>
            <span>CORPORATIVO</span><span>INDUSTRIAL</span><span>COMERCIAL</span><span>RESIDENCIAL</span><span>HOTELERÍA</span><span>EDUCACIÓN</span>
          </div>
        </div>

        {/* ── PRODUCTOS ── */}
        <section id="productos" style={{ background: '#ffffff' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '88px 40px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 44 }}>
              <div>
                <SLabel>— PARA TI</SLabel>
                <h2 style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: 54, lineHeight: 0.96, letterSpacing: '-0.5px', textTransform: 'uppercase', margin: 0 }}>PRODUCTOS<br />DESTACADOS.</h2>
              </div>
              <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
                <RoundBtn onClick={() => prodTrackRef.current?.scrollBy({ left: -prodStep(), behavior: 'smooth' })} flip size={56} border="2px solid rgba(20,18,12,0.14)" arrowSize={18} />
                <RoundBtn onClick={() => prodTrackRef.current?.scrollBy({ left: prodStep(), behavior: 'smooth' })} size={56} border="2px solid rgba(20,18,12,0.14)" arrowSize={18} />
              </div>
            </div>
            <div ref={prodTrackRef} style={{ display: 'flex', alignItems: 'flex-start', gap: 24, overflowX: 'auto', scrollBehavior: 'smooth', width: '100%' }}>
              {PRODUCTS.map((p, i) => (
                <div key={i} style={{ flex: '0 0 calc((100% - 72px) / 4)', minWidth: 200 }}>
                  <div style={{ width: '100%', aspectRatio: '1/1', background: '#f1ece3', borderRadius: 4, overflow: 'hidden' }}>
                    <img alt={p.name} src={p.img} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                  <div style={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: 16, color: '#17150f', marginTop: 16 }}>{p.name}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── EVENTOS ── */}
        <section id="eventos" style={{ background: '#f1ece3' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '88px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 38 }}>
              <div>
                <SLabel>— AGENDA</SLabel>
                <h2 style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: 54, lineHeight: 0.96, letterSpacing: '-0.5px', textTransform: 'uppercase', margin: 0 }}>PRÓXIMOS<br />EVENTOS.</h2>
              </div>
              <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
                <RoundBtn onClick={() => setEvIdx(i => (i - 1 + 3) % 3)} flip />
                <RoundBtn onClick={() => setEvIdx(i => (i + 1) % 3)} />
              </div>
            </div>

            {/* Chip strip */}
            <div style={{ display: 'flex', alignItems: 'stretch', borderTop: '1px solid rgba(20,18,12,0.14)', borderBottom: '1px solid rgba(20,18,12,0.14)', marginBottom: 30 }}>
              <div style={{ display: 'flex', alignItems: 'center', fontFamily: '"Space Mono", monospace', fontSize: 11, letterSpacing: '1.5px', color: '#8a8478', paddingRight: 24, flexShrink: 0 }}>AGO — SEP 2026</div>
              <div style={{ display: 'flex', flex: 1, overflowX: 'auto' }}>
                {EVENTS.map((ev, i) => (
                  <button key={i} onClick={() => setEvIdx(i)} aria-label={ev.title} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 3, padding: '16px 26px', border: 'none', borderLeft: '1px solid rgba(20,18,12,0.14)', background: evIdx === i ? '#ef483d' : 'transparent', color: evIdx === i ? '#ffffff' : '#17150f', cursor: 'pointer', minWidth: 150, flexShrink: 0, transition: 'background 0.3s ease, color 0.3s ease' }}>
                    <span style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: 30, lineHeight: 1 }}>{ev.day}</span>
                    <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, letterSpacing: '1.2px', opacity: 0.72 }}>{ev.month}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Slide area */}
            <div style={{ position: 'relative', height: 520, borderRadius: 4, overflow: 'hidden', background: '#0e0e0e' }}>
              {EVENTS.map((ev, i) => (
                <div key={i} style={{ position: 'absolute', inset: 0, opacity: evIdx === i ? 1 : 0, transition: 'opacity 0.7s ease', pointerEvents: evIdx === i ? 'auto' : 'none' }}>
                  <img alt={ev.title} src={ev.img} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(15,13,11,0.88) 0%, rgba(15,13,11,0.4) 45%, rgba(15,13,11,0) 70%)', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', top: 0, left: 0, background: '#ef483d', color: '#fff', padding: '12px 18px', fontFamily: '"Space Mono", monospace', fontSize: 12, letterSpacing: '1.5px' }}>{ev.badge}</div>
                  <div style={{ position: 'absolute', left: 40, right: 40, bottom: 40 }}>
                    <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 13, letterSpacing: '1px', color: 'rgba(255,255,255,0.72)', marginBottom: 12 }}>{ev.meta}</div>
                    <h3 style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: 56, lineHeight: 0.94, letterSpacing: '-0.5px', margin: '0 0 24px', color: '#fff', textTransform: 'uppercase' }}>{ev.title}</h3>
                    <a href="#contacto" className="iho-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#ef483d', color: '#fff', padding: '14px 26px', borderRadius: 32, fontFamily: '"Source Sans 3", sans-serif', fontWeight: 600, fontSize: 15 }}>
                      Más información
                      <span className="iho-arrow" style={{ display: 'inline-flex', alignItems: 'center' }}><Arr /></span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── GRUPO IHO ── */}
        <section id="grupo" style={{ backgroundColor: '#ffffff' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '84px 40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '0.92fr 1.18fr 0.5fr', gap: 48, alignItems: 'start' }}>
              <div>
                <SLabel>— GRUPO IHO</SLabel>
                <h2 style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: 54, lineHeight: 0.96, letterSpacing: '-0.5px', textTransform: 'uppercase', margin: '0 0 28px' }}>UN GRUPO,<br />TODAS LAS<br />ESCALAS.</h2>
                <p style={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: 15, lineHeight: 1.65, color: '#5a554b', margin: '0 0 18px', maxWidth: 330 }}>Somos un grupo empresarial latinoamericano que ofrece productos y servicios desde el interiorismo corporativo, industrial, comercial y residencial hasta soluciones arquitectónicas y de iluminación.</p>
                <p style={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: 15, lineHeight: 1.65, color: '#5a554b', margin: 0, maxWidth: 330 }}>Una fortaleza logística que permite que tu proyecto, sin importar su tamaño, se resuelva con un solo proveedor.</p>
              </div>
              <div style={{ position: 'relative', minHeight: 520 }}>
                <iframe id="iho-map-frame" src="/mapa-latam.html" title="Mapa Presencia LATAM" scrolling="no" style={{ width: '100%', height: 560, border: 'none', display: 'block', background: '#faf7f1', overflow: 'hidden' }} />
                <div className="iho-ciudad-list" style={{ position: 'absolute', left: 20, top: '45%', fontFamily: '"Source Sans 3", sans-serif', fontSize: 15, lineHeight: 1.4, pointerEvents: 'none' }}>
                  {['CDMX', 'Cd. Juárez', 'Chihuahua', 'Guadalajara', 'Monterrey', 'Tijuana'].map(c => <div key={c} style={{ color: '#3F3E3C', fontWeight: c === 'CDMX' ? 700 : 400 }}>{c}</div>)}
                  {['Guatemala', 'Costa Rica', 'Panamá'].map(c => <div key={c} style={{ color: '#B5B5B5' }}>{c}</div>)}
                </div>
              </div>
              <div id="iho-stats" ref={statsRef} style={{ display: 'flex', flexDirection: 'column' }}>
                {[{ val: '+35', label: 'Años de\nexperiencia' }, { val: '17M', label: 'm²\ninstalados' }, { val: '5', label: 'Áreas de\nnegocio' }, { val: '4', label: 'Países en\nLATAM' }].map((s, i) => (
                  <div key={i} style={{ padding: i === 0 ? '0 0 22px' : i === 3 ? '22px 0 0' : '22px 0', borderBottom: i < 3 ? '1px solid rgba(20,18,12,0.12)' : 'none' }}>
                    <div className="iho-counter" style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: 52, lineHeight: 1, letterSpacing: '-1px' }}>{s.val}</div>
                    <div style={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: 13, color: '#8a8478', marginTop: 4, whiteSpace: 'pre-line' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── PROYECTOS ── */}
        <section id="proyectos" style={{ maxWidth: 1240, margin: '0 auto', padding: '88px 40px' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <SLabel>— PROYECTOS</SLabel>
            <SH2>MARCAS QUE YA<br />CONFIARON.</SH2>
            <p style={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: 15, lineHeight: 1.6, color: '#7a756a', maxWidth: 430, margin: '0 auto' }}>Estos son algunos de los proyectos emblemáticos donde IHO ha materializado el diseño interior, transformando la arquitectura en atmósferas con identidad y propósito.</p>
          </div>
          <div id="iho-proj-grid" ref={projRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridAutoRows: 215, gap: 14 }}>
            {[
              { img: '/images/proyectos/proyecto-entretenimiento-digital.webp', alt: 'Empresa de Entretenimiento Digital', title: 'EMPRESA DE ENTRETENIMIENTO DIGITAL', desc: 'Equipamiento integral de un espacio dinámico y vanguardista, donde amueblamos cada rincón para potenciar la creatividad y el talento al máximo.', titleSize: 38, col: '1 / 3', row: '1 / 3' },
              { img: '/images/proyectos/proyecto-ecommerce.webp', alt: 'Empresa de E-Commerce', title: 'EMPRESA DE E-COMMERCE', desc: 'Un proyecto con identidad cultural única que celebra la tradición local a través de mobiliario artesanal de más de 50 marcas mexicanas.', col: '3 / 5', row: '1 / 2' },
              { img: '/images/proyectos/proyecto-hyundai.webp', alt: 'Hyundai', title: 'HYUNDAI', desc: 'Se transformó el espacio con ingeniería acústica personalizada y acabados premium, logrando un resultado sobresaliente.', col: '3 / 5', row: '2 / 3' },
              { img: '/images/proyectos/proyecto-ios.webp', alt: 'IOS', title: 'IOS', desc: 'Espacio contemporáneo disruptivo con mobiliario de alta gama, siluetas expresivas y colores neón.', col: '1 / 2', row: '3 / 4' },
              { img: '/images/proyectos/proyecto-isuzu.webp', alt: 'Isuzu', title: 'ISUZU', desc: 'Diseño minimalista de estética japonesa y alta funcionalidad que combina áreas colaborativas y tecnología premium.', col: '2 / 4', row: '3 / 4' },
              { img: '/images/proyectos/proyecto-technology-center.webp', alt: 'Technology Center', title: 'TECHNOLOGY CENTER', desc: 'Un hub funcional y tecnológico diseñado para impulsar la innovación y las soluciones del futuro.', col: '4 / 5', row: '3 / 4' },
            ].map((p, i) => (
              <div key={i} className="iho-stagger" style={{ gridColumn: p.col, gridRow: p.row, height: '100%' }}>
                <div className="iho-proj-card" style={{ height: '100%' }}>
                  <img alt={p.alt} src={p.img} />
                  <div className="pc-grad" />
                  <div style={{ position: 'absolute', left: 24, right: 24, bottom: 22, pointerEvents: 'none' }}>
                    <div className="pc-title" style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: p.titleSize ?? 22, lineHeight: 1, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{p.title}</div>
                    <div className="pc-desc" style={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: 13, lineHeight: 1.5, color: 'rgba(255,255,255,0.9)', maxWidth: 340 }}>{p.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── MARCAS ── */}
        <section id="marcas" style={{ background: '#f1ece3' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '84px 40px', display: 'grid', gridTemplateColumns: '0.85fr 1.15fr', gap: 60, alignItems: 'start' }}>
            <div>
              <SLabel style={{ marginBottom: 22 }}>— MARCAS</SLabel>
              <h2 style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: 54, lineHeight: 0.96, letterSpacing: '-0.5px', textTransform: 'uppercase', margin: '0 0 22px' }}>PROPUESTA<br />MULTIMARCA.</h2>
              <p style={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: 15, lineHeight: 1.65, color: '#5a554b', maxWidth: 320, margin: 0 }}>Curaduría y distribución de más de 150 marcas líderes a nivel mundial que transforman el espacio corporativo en atmósferas únicas, innovadoras y personalizadas.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderLeft: '1px solid rgba(20,18,12,0.12)' }}>
              {BRANDS.map((b, i) => (
                <div key={b.slug} style={{ height: 120, borderRight: '1px solid rgba(20,18,12,0.12)', borderBottom: i < 12 ? '1px solid rgba(20,18,12,0.12)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: b.thin ? 8 : 22 }}>
                  <img src={`/images/marcas/marca-${b.slug}.png`} alt={b.alt} style={{ maxWidth: '100%', maxHeight: b.thin ? 104 : 60, objectFit: 'contain', opacity: 0.92 }} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ÁREAS ── */}
        <section id="areas" style={{ background: '#f1ece3' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '88px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 44 }}>
              <div>
                <SLabel>— ÁREAS IHO</SLabel>
                <h2 style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: 54, lineHeight: 0.96, letterSpacing: '-0.5px', textTransform: 'uppercase', margin: 0 }}>UNA PUERTA<br />POR INDUSTRIA.</h2>
              </div>
              <IhoBtn href="#areas" style={{ padding: '13px 24px', fontSize: 14, gap: 9 }}>Ver todas las áreas</IhoBtn>
            </div>
            <div id="iho-areas-grid" ref={areasRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
              {[
                { num: '01', img: '/images/areas/area-workspace.webp', title: 'Workspace', desc: 'Mobiliario y diseño integral para oficinas corporativas.', span: 2 },
                { num: '02', img: '/images/areas/area-specialty.webp', title: 'Specialty', desc: 'Productos y soluciones especiales para proyectos exigentes.' },
                { num: '03', img: '/images/areas/area-lighting.webp', title: 'Lighting', desc: 'Diseño y soluciones de iluminación arquitectónica para cada espacio.' },
                { num: '04', img: '/images/areas/area-hospitality.webp', title: 'Hospitality', desc: 'Ambientes para hoteles, restaurantes y espacios de servicio.' },
                { num: '05', img: '/images/areas/area-commerce-retail.webp', title: 'Commerce & Retail', desc: 'Experiencias de marca para espacios comerciales y retail.' },
              ].map((a, i) => (
                <div key={i} className="iho-stagger" style={a.span ? { gridColumn: `span ${a.span}` } : {}}>
                  <div className="iho-area-card">
                    <img alt={a.title} src={a.img} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.04) 38%, rgba(0,0,0,0.62) 100%)', pointerEvents: 'none' }} />
                    <div className="ac-wash" />
                    <div className="ac-num">{a.num}</div>
                    <div style={{ position: 'absolute', left: 22, right: 56, bottom: 20 }}>
                      <div style={{ fontFamily: ACUMIN, fontWeight: 700, fontSize: 26, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{a.title}</div>
                      <div className="ac-desc">{a.desc}</div>
                    </div>
                    <div className="ac-arrow"><Arr w={22} h={19} /></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── EQUIPO ── */}
        <section id="equipo" style={{ maxWidth: 1240, margin: '0 auto', padding: '88px 40px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <SLabel>— EQUIPO</SLabel>
            <SH2>SOMOS MÁS DE +120<br />PROFESIONALES.</SH2>
            <p style={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: 15, lineHeight: 1.6, color: '#7a756a', maxWidth: 430, margin: '0 auto' }}>En IHO, nuestro éxito se construye gracias al talento y la diversidad de nuestro equipo. Fomentamos un entorno inclusivo donde distintas perspectivas impulsan la colaboración, el aprendizaje y el crecimiento conjunto.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
            {TEAM.map(m => (
              <div key={m.name} className="iho-team-card">
                <div style={{ aspectRatio: '3/4', borderRadius: 4, overflow: 'hidden', background: '#e7e2d9', position: 'relative' }}>
                  <img alt={m.name} src={m.img} style={{ objectPosition: m.pos }} />
                  <div className="tc-tint" style={{ position: 'absolute', inset: 0, background: '#ef483d', mixBlendMode: 'multiply', opacity: 0, transition: 'opacity 0.6s ease', pointerEvents: 'none' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 12 }}>
                  <a href="#" aria-label="LinkedIn" style={{ display: 'flex', alignItems: 'center', flexShrink: 0, opacity: 0.55 }}><LinkedInIcon /></a>
                  <div style={{ fontFamily: ACUMIN, fontWeight: 700, fontSize: 18, textTransform: 'uppercase', color: '#17150f', lineHeight: 1 }}>{m.name}</div>
                </div>
                <div className="tc-bar" style={{ height: 2, background: '#ef483d', width: 0, marginTop: 6, transition: 'width 0.45s cubic-bezier(0.2,0,0.2,1)' }} />
                <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, letterSpacing: '1px', color: '#ef483d', marginTop: 7 }}>{m.role}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CONTACTO ── */}
        <section id="contacto" style={{ background: '#f1ece3' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '84px 40px', display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 56, alignItems: 'stretch' }}>
            <div>
              <SLabel>— CONTACTO</SLabel>
              <h2 style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: 48, lineHeight: 0.98, letterSpacing: '-0.5px', textTransform: 'uppercase', margin: '0 0 34px', color: '#000' }}>CONTACTA CON IHO</h2>
              <form onSubmit={e => e.preventDefault()} style={{ fontFamily: '"Source Sans 3", sans-serif' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26, marginBottom: 26 }}>
                  <input type="text" placeholder="Nombre" style={{ border: 'none', borderBottom: '1px solid rgba(20,18,12,0.28)', background: 'transparent', padding: '10px 2px', fontSize: 15, fontFamily: 'inherit', color: '#17150f' }} />
                  <input type="text" placeholder="Apellido" style={{ border: 'none', borderBottom: '1px solid rgba(20,18,12,0.28)', background: 'transparent', padding: '10px 2px', fontSize: 15, fontFamily: 'inherit', color: '#17150f' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26, marginBottom: 26 }}>
                  <input type="email" placeholder="Correo electrónico" style={{ border: 'none', borderBottom: '1px solid rgba(20,18,12,0.28)', background: 'transparent', padding: '10px 2px', fontSize: 15, fontFamily: 'inherit', color: '#17150f' }} />
                  <input type="tel" placeholder="Teléfono" style={{ border: 'none', borderBottom: '1px solid rgba(20,18,12,0.28)', background: 'transparent', padding: '10px 2px', fontSize: 15, fontFamily: 'inherit', color: '#17150f' }} />
                </div>
                <textarea placeholder="Cuéntanos más de tu proyecto" rows={2} style={{ width: '100%', border: 'none', borderBottom: '1px solid rgba(20,18,12,0.28)', background: 'transparent', padding: '10px 2px', fontSize: 15, fontFamily: 'inherit', color: '#17150f', resize: 'none', marginBottom: 30 }} />
                <button type="submit" className="iho-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#ef483d', color: '#fff', border: 'none', padding: '14px 30px', borderRadius: 32, fontFamily: 'inherit', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
                  Enviar
                  <span className="iho-arrow" style={{ display: 'inline-flex', alignItems: 'center' }}><Arr /></span>
                </button>
              </form>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 54, paddingTop: 30, borderTop: '1px solid rgba(20,18,12,0.12)' }}>
                {ADDRESSES.map(a => (
                  <div key={a.city}>
                    <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, letterSpacing: '1px', color: a.muted ? '#8a8478' : '#17150f', fontWeight: 700, marginBottom: 10 }}>{a.city}</div>
                    <div style={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: 13, lineHeight: 1.6, color: a.muted ? '#8a8478' : '#7a756a' }}>{a.addr}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ position: 'relative', borderRadius: 6, overflow: 'hidden' }}>
              <img alt="Contacto IHO" src="/images/contacto/contacto.webp" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ background: '#1a1916', color: '#c9c4ba' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '30px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <img src="/images/logo-iho-white.png" alt="IHO" style={{ height: 30, display: 'block' }} />
            <div style={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: 13, color: '#8a857b' }}>© {new Date().getFullYear()} Grupo IHO. Todos los derechos reservados.</div>
            <div style={{ display: 'flex', gap: 28, fontFamily: '"Source Sans 3", sans-serif', fontSize: 13 }}>
              <a href="#" style={{ color: '#c9c4ba' }}>Aviso de privacidad</a>
              <a href="#contacto" style={{ color: '#c9c4ba' }}>Contacto</a>
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}
