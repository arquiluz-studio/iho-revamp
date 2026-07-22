'use client'
import Script from 'next/script'

const ACUMIN = '"Acumin Variable Condensed", "Acumin Pro Condensed", "Saira Condensed", sans-serif'

const ArrowSvg = ({ width = 17, height = 15 }: { width?: number; height?: number }) => (
  <svg viewBox="0 0 26 23" width={width} height={height} fill="currentColor" style={{ display: 'block', flex: 'none' }}>
    <path d="M14.9922 0.907227C15.5854 0.343852 16.5108 0.355639 17.1152 1.00195L17.124 1.01074L17.1318 1.02051L25.1328 10.4727L25.1484 10.4922L25.1631 10.5127C25.3539 10.7913 25.4917 11.1077 25.5 11.4648C25.5084 11.8252 25.3839 12.1656 25.1641 12.4883L25.1494 12.5098L25.1328 12.5293L17.1318 21.9814L17.1289 21.9854C16.64 22.5526 15.7236 22.6944 15.1006 22.1924L14.9805 22.084C14.6941 21.7942 14.5482 21.4033 14.5283 21.0264C14.5084 20.6492 14.6124 20.2394 14.8867 19.9209L20.7031 13.0518H2C1.14833 13.0517 0.5 12.3342 0.5 11.501C0.500069 10.6678 1.14836 9.95119 2 9.95117H20.7031L14.8867 3.08008V3.08105C14.614 2.76423 14.5066 2.35345 14.5244 1.97461C14.5423 1.59564 14.6884 1.1958 14.9922 0.907227Z" />
  </svg>
)

const LinkedInSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="#17150F">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
  </svg>
)

const IhoBtn = ({ href, children, style }: { href: string; children: React.ReactNode; style?: React.CSSProperties }) => (
  <a href={href} className="iho-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#ef483d', color: '#fff', padding: '14px 26px', borderRadius: 32, fontFamily: '"Source Sans 3", sans-serif', fontWeight: 600, fontSize: 15, ...style }}>
    {children}
    <span className="iho-arrow" style={{ display: 'inline-flex', alignItems: 'center' }}>
      <ArrowSvg />
    </span>
  </a>
)

const SectionLabel = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 12, letterSpacing: '1.5px', color: '#ef483d', marginBottom: 18, ...style }}>
    {children}
  </div>
)

const SectionH2 = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <h2 style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: 50, lineHeight: 0.98, letterSpacing: '-0.5px', textTransform: 'uppercase', margin: '0 0 18px', ...style }}>
    {children}
  </h2>
)

const AreaCard = ({ num, img, title, desc }: { num: string; img: string; title: string; desc: string }) => (
  <div className="iho-area-card">
    <img alt={title} src={img} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.04) 38%, rgba(0,0,0,0.62) 100%)', pointerEvents: 'none' }} />
    <div className="ac-wash" />
    <div className="ac-num">{num}</div>
    <div style={{ position: 'absolute', left: 22, right: 56, bottom: 20 }}>
      <div style={{ fontFamily: ACUMIN, fontWeight: 700, fontSize: 26, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{title}</div>
      <div className="ac-desc">{desc}</div>
    </div>
    <div className="ac-arrow">
      <ArrowSvg width={22} height={19} />
    </div>
  </div>
)

const ProjCard = ({ img, alt, title, desc, titleSize = 22 }: { img: string; alt: string; title: string; desc: string; titleSize?: number }) => (
  <div className="iho-proj-card" style={{ height: '100%' }}>
    <img alt={alt} src={img} />
    <div className="pc-grad" />
    <div style={{ position: 'absolute', left: 24, right: 24, bottom: 22, pointerEvents: 'none' }}>
      <div className="pc-title" style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: titleSize, lineHeight: 1, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{title}</div>
      <div className="pc-desc" style={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: 13, lineHeight: 1.5, color: 'rgba(255,255,255,0.9)', maxWidth: 340 }}>{desc}</div>
    </div>
  </div>
)

const TeamCard = ({ img, name, role, objectPosition = '50% 0%' }: { img: string; name: string; role: string; objectPosition?: string }) => (
  <div className="iho-team-card">
    <div style={{ aspectRatio: '3/4', borderRadius: 4, overflow: 'hidden', background: '#e7e2d9', position: 'relative' }}>
      <img alt={name} src={img} style={{ objectPosition }} />
      <div className="tc-tint" style={{ position: 'absolute', inset: 0, background: '#ef483d', mixBlendMode: 'multiply', opacity: 0, transition: 'opacity 0.6s ease', pointerEvents: 'none' }} />
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 12 }}>
      <a href="#" aria-label="LinkedIn" style={{ display: 'flex', alignItems: 'center', flexShrink: 0, opacity: 0.55, transition: 'opacity 0.25s ease' }}>
        <LinkedInSvg />
      </a>
      <div style={{ fontFamily: ACUMIN, fontWeight: 700, fontSize: 18, textTransform: 'uppercase', color: '#17150f', lineHeight: 1 }}>{name}</div>
    </div>
    <div className="tc-bar" style={{ height: 2, background: '#ef483d', width: 0, marginTop: 6, transition: 'width 0.45s cubic-bezier(0.2,0,0.2,1)' }} />
    <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, letterSpacing: '1px', color: '#ef483d', marginTop: 7 }}>{role}</div>
  </div>
)

const ContactInput = ({ type = 'text', placeholder }: { type?: string; placeholder: string }) => (
  <input type={type} placeholder={placeholder} style={{ border: 'none', borderBottom: '1px solid rgba(20,18,12,0.28)', background: 'transparent', padding: '10px 2px', fontSize: 15, fontFamily: 'inherit', color: '#17150f' }} />
)

const ContactAddress = ({ city, address, muted = false }: { city: string; address: string; muted?: boolean }) => (
  <div>
    <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, letterSpacing: '1px', color: muted ? '#8a8478' : '#17150f', fontWeight: 700, marginBottom: 10 }}>{city}</div>
    <div style={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: 13, lineHeight: 1.6, color: muted ? '#8a8478' : '#7a756a' }}>{address}</div>
  </div>
)

export default function Home() {
  return (
    <>
      <Script src="/iho-behaviors.js" strategy="afterInteractive" />
      <div style={{ width: '100%', overflowX: 'hidden' }}>

        {/* ============ HEADER ============ */}
        <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60, background: '#faf7f1', borderBottom: '1px solid rgba(20,18,12,0.08)' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '18px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <img src="/images/logo-iho-black.png" alt="IHO" style={{ height: 36, display: 'block' }} />
            </div>
            <nav style={{ display: 'flex', alignItems: 'center', gap: 34, fontFamily: '"Source Sans 3", sans-serif', fontSize: 15, fontWeight: 500, color: '#2c2920' }}>
              <a href="#grupo" className="iho-nav-link">Grupo IHO</a>
              <a href="#areas" className="iho-nav-link">Áreas</a>
              <a href="#proyectos" className="iho-nav-link">Proyectos</a>
              <a href="#marcas" className="iho-nav-link">Marcas</a>
              <a href="#contacto" className="iho-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#ef483d', color: '#fff', padding: '10px 20px', borderRadius: 30, fontWeight: 600 }}>
                Contactar
                <span className="iho-arrow" style={{ display: 'inline-flex', alignItems: 'center' }}><ArrowSvg width={15} height={13} /></span>
              </a>
            </nav>
            <button id="iho-menu-btn" aria-label="Menú" aria-expanded="false">
              <span /><span /><span />
            </button>
          </div>
        </header>
        <div style={{ height: 72 }} />

        {/* ============ HERO CARRUSEL ============ */}
        <section className="iho-hero-section" style={{ padding: 14 }}>
          <div className="iho-hero-box" style={{ position: 'relative', height: 560, borderRadius: 6, overflow: 'hidden', background: '#0e0e0e' }}>
            <div id="iho-carousel-track" style={{ position: 'absolute', inset: 0, display: 'flex', width: '500%', height: '100%', transform: 'translateX(0%)', transition: 'transform 0.85s cubic-bezier(0.4,0,0.2,1)' }}>
              {[
                { src: '/images/hero/hero-socialmedia.webp', alt: 'Social Media IHO' },
                { src: '/images/hero/hero-ecommerce.webp', alt: 'Ecommerce IHO' },
                { src: '/images/hero/hero-slide3.jpg', alt: 'Hero 3 IHO' },
                { src: '/images/hero/hero-slide4.png', alt: 'Hero 4 IHO' },
                { src: '/images/hero/hero-molteni.webp', alt: 'Molteni IHO' },
              ].map((slide, i) => (
                <div key={i} style={{ flex: '0 0 20%', height: '100%' }}>
                  <img alt={slide.alt} src={slide.src} className="iho-hero-img" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              ))}
            </div>

            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(8,8,8,0.88) 0%, rgba(8,8,8,0.62) 38%, rgba(8,8,8,0.12) 70%, rgba(8,8,8,0) 100%)', pointerEvents: 'none' }} />

            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <div className="iho-hero-overlay" style={{ maxWidth: 1240, height: '100%', margin: '0 auto', padding: '0 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 13, letterSpacing: '2.5px', color: 'rgba(255,255,255,0.85)', marginBottom: 22 }}>EST. 1992 · LATINOAMÉRICA</div>
                <h1 style={{ fontFamily: '"Acumin Variable Condensed", "Acumin Pro Condensed", "Saira Condensed", sans-serif', fontWeight: 800, color: '#fff', fontSize: 72, lineHeight: 0.92, letterSpacing: '-0.5px', margin: '0 0 30px', textTransform: 'uppercase' }}>
                  TODO EL PROYECTO,<br /><span style={{ color: '#ef483d' }}>UN SOLO</span> PROVEEDOR.
                </h1>
                <IhoBtn href="#contacto" style={{ pointerEvents: 'auto', alignSelf: 'flex-start' }}>Cuéntanos tu proyecto</IhoBtn>
              </div>
            </div>

            <button id="iho-prev-btn" aria-label="Anterior" style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', width: 46, height: 46, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.35)', background: 'rgba(0,0,0,0.25)', color: '#fff', cursor: 'pointer', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 26 23" width="18" height="16" fill="currentColor" style={{ display: 'block', flex: 'none', transform: 'scaleX(-1)' }}>
                <path d="M14.9922 0.907227C15.5854 0.343852 16.5108 0.355639 17.1152 1.00195L17.124 1.01074L17.1318 1.02051L25.1328 10.4727L25.1484 10.4922L25.1631 10.5127C25.3539 10.7913 25.4917 11.1077 25.5 11.4648C25.5084 11.8252 25.3839 12.1656 25.1641 12.4883L25.1494 12.5098L25.1328 12.5293L17.1318 21.9814L17.1289 21.9854C16.64 22.5526 15.7236 22.6944 15.1006 22.1924L14.9805 22.084C14.6941 21.7942 14.5482 21.4033 14.5283 21.0264C14.5084 20.6492 14.6124 20.2394 14.8867 19.9209L20.7031 13.0518H2C1.14833 13.0517 0.5 12.3342 0.5 11.501C0.500069 10.6678 1.14836 9.95119 2 9.95117H20.7031L14.8867 3.08008V3.08105C14.614 2.76423 14.5066 2.35345 14.5244 1.97461C14.5423 1.59564 14.6884 1.1958 14.9922 0.907227Z" />
              </svg>
            </button>
            <button id="iho-next-btn" aria-label="Siguiente" style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', width: 46, height: 46, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.35)', background: 'rgba(0,0,0,0.25)', color: '#fff', cursor: 'pointer', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowSvg width={18} height={16} />
            </button>

            <div style={{ position: 'absolute', bottom: 26, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 9 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <button key={i} id={`iho-dot-${i}`} aria-label="slide" style={{ height: 9, width: i === 0 ? 28 : 9, background: i === 0 ? '#fff' : 'rgba(255,255,255,0.45)', border: 'none', borderRadius: 9, padding: 0, cursor: 'pointer', transition: 'all 0.35s' }} />
              ))}
            </div>
          </div>
        </section>

        {/* ============ INDUSTRY STRIP ============ */}
        <div style={{ borderTop: '1px solid rgba(20,18,12,0.1)', borderBottom: '1px solid rgba(20,18,12,0.1)' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '18px 40px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, fontFamily: '"Space Mono", monospace', fontSize: 12, letterSpacing: '1.5px', color: '#8a8478', backgroundColor: '#ffffff' }}>
            <span>CORPORATIVO</span><span>INDUSTRIAL</span><span>COMERCIAL</span><span>RESIDENCIAL</span><span>HOTELERÍA</span><span>EDUCACIÓN</span>
          </div>
        </div>

        {/* ============ GRUPO ============ */}
        <section id="grupo" style={{ backgroundColor: '#ffffff' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '84px 40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '0.92fr 1.18fr 0.5fr', gap: 48, alignItems: 'start' }}>
              <div>
                <SectionLabel>— GRUPO IHO</SectionLabel>
                <h2 style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: 54, lineHeight: 0.96, letterSpacing: '-0.5px', textTransform: 'uppercase', margin: '0 0 28px' }}>
                  UN GRUPO,<br />TODAS LAS<br />ESCALAS.
                </h2>
                <p style={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: 15, lineHeight: 1.65, color: '#5a554b', margin: '0 0 18px', maxWidth: 330 }}>
                  Somos un grupo empresarial latinoamericano que ofrece productos y servicios desde el interiorismo corporativo, industrial, comercial y residencial hasta soluciones arquitectónicas y de iluminación.
                </p>
                <p style={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: 15, lineHeight: 1.65, color: '#5a554b', margin: 0, maxWidth: 330 }}>
                  Una fortaleza logística que permite que tu proyecto, sin importar su tamaño, se resuelva con un solo proveedor.
                </p>
              </div>
              <div style={{ position: 'relative', minHeight: 520 }}>
                <iframe id="iho-map-frame" src="/mapa-latam.html" title="Mapa Presencia LATAM" scrolling="no" style={{ width: '100%', height: 560, border: 'none', display: 'block', background: '#faf7f1', overflow: 'hidden' }} />
                <div className="iho-ciudad-list" style={{ position: 'absolute', left: 20, top: '45%', fontFamily: '"Source Sans 3", sans-serif', fontSize: 15, lineHeight: 1.4, pointerEvents: 'none' }}>
                  {['CDMX','Cd. Juárez','Chihuahua','Guadalajara','Monterrey','Tijuana'].map(c => (
                    <div key={c} style={{ color: '#3F3E3C', fontWeight: c === 'CDMX' ? 700 : 400 }}>{c}</div>
                  ))}
                  {['Guatemala','Costa Rica','Panamá'].map(c => (
                    <div key={c} style={{ color: '#B5B5B5' }}>{c}</div>
                  ))}
                </div>
              </div>
              <div id="iho-stats" style={{ display: 'flex', flexDirection: 'column' }}>
                {([
                  { val: '+35', label: 'Años de\nexperiencia' },
                  { val: '17M', label: 'm²\ninstalados' },
                  { val: '5', label: 'Áreas de\nnegocio' },
                  { val: '4', label: 'Países en\nLATAM' },
                ] as const).map((stat, i) => (
                  <div key={i} style={{ padding: i === 0 ? '0 0 22px' : i === 3 ? '22px 0 0' : '22px 0', borderBottom: i < 3 ? '1px solid rgba(20,18,12,0.12)' : 'none' }}>
                    <div className="iho-counter" style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: 52, lineHeight: 1, letterSpacing: '-1px' }}>{stat.val}</div>
                    <div style={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: 13, color: '#8a8478', marginTop: 4, whiteSpace: 'pre-line' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============ ÁREAS ============ */}
        <section id="areas" style={{ background: '#f1ece3' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '88px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 44 }}>
              <div>
                <SectionLabel>— ÁREAS IHO</SectionLabel>
                <h2 style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: 54, lineHeight: 0.96, letterSpacing: '-0.5px', textTransform: 'uppercase', margin: 0 }}>
                  UNA PUERTA<br />POR INDUSTRIA.
                </h2>
              </div>
              <IhoBtn href="#areas" style={{ padding: '13px 24px', fontSize: 14, gap: 9 }}>Ver todas las áreas</IhoBtn>
            </div>
            <div id="iho-areas-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
              <div className="iho-stagger" style={{ gridColumn: 'span 2' }}>
                <AreaCard num="01" img="/images/areas/area-workspace.webp" title="Workspace" desc="Mobiliario y diseño integral para oficinas corporativas." />
              </div>
              <div className="iho-stagger">
                <AreaCard num="02" img="/images/areas/area-specialty.webp" title="Specialty" desc="Productos y soluciones especiales para proyectos exigentes." />
              </div>
              <div className="iho-stagger">
                <AreaCard num="03" img="/images/areas/area-lighting.webp" title="Lighting" desc="Diseño y soluciones de iluminación arquitectónica para cada espacio." />
              </div>
              <div className="iho-stagger">
                <AreaCard num="04" img="/images/areas/area-hospitality.webp" title="Hospitality" desc="Ambientes para hoteles, restaurantes y espacios de servicio." />
              </div>
              <div className="iho-stagger">
                <AreaCard num="05" img="/images/areas/area-commerce-retail.webp" title="Commerce & Retail" desc="Experiencias de marca para espacios comerciales y retail." />
              </div>
            </div>
          </div>
        </section>

        {/* ============ PROYECTOS ============ */}
        <section id="proyectos" style={{ maxWidth: 1240, margin: '0 auto', padding: '88px 40px' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <SectionLabel>— PROYECTOS</SectionLabel>
            <SectionH2>MARCAS QUE YA<br />CONFIARON.</SectionH2>
            <p style={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: 15, lineHeight: 1.6, color: '#7a756a', maxWidth: 430, margin: '0 auto' }}>
              Estos son algunos de los proyectos emblemáticos donde IHO ha materializado el diseño interior, transformando la arquitectura en atmósferas con identidad y propósito.
            </p>
          </div>
          <div id="iho-proj-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridAutoRows: 215, gap: 14 }}>
            <div className="iho-stagger" style={{ gridColumn: '1 / 3', gridRow: '1 / 3' }}>
              <ProjCard img="/images/proyectos/proyecto-entretenimiento-digital.webp" alt="Empresa de Entretenimiento Digital" title="EMPRESA DE ENTRETENIMIENTO DIGITAL" desc="Equipamiento integral de un espacio dinámico y vanguardista, donde amueblamos cada rincón para potenciar la creatividad y el talento al máximo." titleSize={38} />
            </div>
            <div className="iho-stagger" style={{ gridColumn: '3 / 5', gridRow: '1 / 2' }}>
              <ProjCard img="/images/proyectos/proyecto-ecommerce.webp" alt="Empresa de E-Commerce" title="EMPRESA DE E-COMMERCE" desc="Un proyecto con identidad cultural única que celebra la tradición local a través de mobiliario artesanal de más de 50 marcas mexicanas." />
            </div>
            <div className="iho-stagger" style={{ gridColumn: '3 / 5', gridRow: '2 / 3' }}>
              <ProjCard img="/images/proyectos/proyecto-hyundai.webp" alt="Hyundai" title="HYUNDAI" desc="Se transformó el espacio con ingeniería acústica personalizada y acabados premium, logrando un resultado sobresaliente gracias a la atención al detalle y al trabajo en equipo." />
            </div>
            <div className="iho-stagger" style={{ gridColumn: '1 / 2', gridRow: '3 / 4' }}>
              <ProjCard img="/images/proyectos/proyecto-ios.webp" alt="IOS" title="IOS" desc="Espacio contemporáneo disruptivo con mobiliario de alta gama, siluetas expresivas y colores neón." />
            </div>
            <div className="iho-stagger" style={{ gridColumn: '2 / 4', gridRow: '3 / 4' }}>
              <ProjCard img="/images/proyectos/proyecto-isuzu.webp" alt="Isuzu" title="ISUZU" desc="Diseño minimalista de estética japonesa y alta funcionalidad que combina áreas colaborativas, de relajación y tecnología premium para potenciar el bienestar laboral." />
            </div>
            <div className="iho-stagger" style={{ gridColumn: '4 / 5', gridRow: '3 / 4' }}>
              <ProjCard img="/images/proyectos/proyecto-technology-center.webp" alt="Technology Center" title="TECHNOLOGY CENTER" desc="Un hub funcional y tecnológico diseñado para impulsar la innovación y las soluciones del futuro." />
            </div>
          </div>
        </section>

        {/* ============ MARCAS ============ */}
        <section id="marcas" style={{ background: '#f1ece3' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '84px 40px', display: 'grid', gridTemplateColumns: '0.85fr 1.15fr', gap: 60, alignItems: 'start' }}>
            <div>
              <SectionLabel style={{ marginBottom: 22 }}>— MARCAS</SectionLabel>
              <h2 style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: 54, lineHeight: 0.96, letterSpacing: '-0.5px', textTransform: 'uppercase', margin: '0 0 22px' }}>
                PROPUESTA<br />MULTIMARCA.
              </h2>
              <p style={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: 15, lineHeight: 1.65, color: '#5a554b', maxWidth: 320, margin: 0 }}>
                Curaduría y distribución de más de 150 marcas líderes a nivel mundial que transforman el espacio corporativo en atmósferas únicas, innovadoras y personalizadas a través de mobiliario, iluminación y productos arquitectónicos de alta gama.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderLeft: '1px solid rgba(20,18,12,0.12)' }}>
              {[
                { slug: 'allermuir', alt: 'Allermuir' },
                { slug: 'allsteel', alt: 'Allsteel' },
                { slug: 'andreu-world', alt: 'Andreu World', thin: true },
                { slug: 'bolon', alt: 'BOLON' },
                { slug: 'brokis', alt: 'BROKIS' },
                { slug: 'delta-light', alt: 'DELTA LIGHT' },
                { slug: 'flos', alt: 'FLOS' },
                { slug: 'fritz-hansen', alt: 'FRITZ HANSEN', thin: true },
                { slug: 'kriskadecor', alt: 'kriskadecor', thin: true },
                { slug: 'luft', alt: 'Luft' },
                { slug: 'occhio', alt: 'Occhio' },
                { slug: 'parachilna', alt: 'PARACHILNA', thin: true },
                { slug: 'the-senator-group', alt: 'The Senator Group', thin: true },
                { slug: 'targetti', alt: 'TARGETTI' },
                { slug: 'unifor', alt: 'UniFor' },
                { slug: 'vitra', alt: 'Vitra' },
              ].map((brand, i) => (
                <div key={brand.slug} style={{ height: 120, borderRight: '1px solid rgba(20,18,12,0.12)', borderBottom: i < 12 ? '1px solid rgba(20,18,12,0.12)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: brand.thin ? 8 : 22 }}>
                  <img
                    src={`/images/marcas/marca-${brand.slug}.png`}
                    alt={brand.alt}
                    style={{ maxWidth: '100%', maxHeight: brand.thin ? 104 : 60, objectFit: 'contain', opacity: 0.92 }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ EQUIPO ============ */}
        <section id="equipo" style={{ maxWidth: 1240, margin: '0 auto', padding: '88px 40px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <SectionLabel>— EQUIPO</SectionLabel>
            <SectionH2>SOMOS MÁS DE +120<br />PROFESIONALES.</SectionH2>
            <p style={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: 15, lineHeight: 1.6, color: '#7a756a', maxWidth: 430, margin: '0 auto' }}>
              En IHO, nuestro éxito se construye gracias al talento y la diversidad de nuestro equipo. Fomentamos un entorno inclusivo donde distintas perspectivas impulsan la colaboración, el aprendizaje y el crecimiento conjunto.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
            <TeamCard img="/images/equipo/equipo-salvador-miranda.png" name="Salvador Miranda" role="CEO" objectPosition="0% 0%" />
            <TeamCard img="/images/equipo/equipo-daniela-garcia.png" name="Daniela García" role="Regional Workspace Director" objectPosition="0% 9.5%" />
            <TeamCard img="/images/equipo/equipo-lupina-cornejo.png" name="Lupina Cornejo" role="Comercial Director, Ciento Once" objectPosition="0% 0%" />
            <TeamCard img="/images/equipo/equipo-manolo-macedo.png" name="Manuel Macedo" role="Lighting Director" objectPosition="0% 0%" />
            <TeamCard img="/images/equipo/equipo-estefania-lara.png" name="Estefania Lara" role="Flooring Manager" objectPosition="0% 9.5%" />
          </div>
        </section>

        {/* ============ CONTACTO ============ */}
        <section id="contacto" style={{ background: '#f1ece3' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '84px 40px', display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 56, alignItems: 'stretch' }}>
            <div>
              <SectionLabel>— CONTACTO</SectionLabel>
              <h2 style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: 48, lineHeight: 0.98, letterSpacing: '-0.5px', textTransform: 'uppercase', margin: '0 0 34px', color: '#000' }}>
                CONTACTA CON IHO
              </h2>
              <form onSubmit={(e) => e.preventDefault()} style={{ fontFamily: '"Source Sans 3", sans-serif' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26, marginBottom: 26 }}>
                  <ContactInput placeholder="Nombre" />
                  <ContactInput placeholder="Apellido" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26, marginBottom: 26 }}>
                  <ContactInput type="email" placeholder="Correo electrónico" />
                  <ContactInput type="tel" placeholder="Teléfono" />
                </div>
                <textarea placeholder="Cuéntanos más de tu proyecto" rows={2} style={{ width: '100%', border: 'none', borderBottom: '1px solid rgba(20,18,12,0.28)', background: 'transparent', padding: '10px 2px', fontSize: 15, fontFamily: 'inherit', color: '#17150f', resize: 'none', marginBottom: 30 }} />
                <button type="submit" className="iho-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#ef483d', color: '#fff', border: 'none', padding: '14px 30px', borderRadius: 32, fontFamily: 'inherit', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
                  Enviar
                  <span className="iho-arrow" style={{ display: 'inline-flex', alignItems: 'center' }}><ArrowSvg /></span>
                </button>
              </form>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 54, paddingTop: 30, borderTop: '1px solid rgba(20,18,12,0.12)' }}>
                <ContactAddress city="CIUDAD DE MÉXICO" address="Juan Vazquez de Mella 481-Primer Piso, Polanco, Miguel Hidalgo, 11550, CDMX." />
                <ContactAddress city="MONTERREY" address="Calz. del Valle 111, Del Valle, 66220 San Pedro Garza García, Nuevo León." />
                <ContactAddress city="GUADALAJARA" address="Torre Patria Hipódromo. Av. Patria 1721, Planta Baja. Col. Colomos Providencia, C.P. 44660 Guadalajara, Jalisco." />
                <ContactAddress city="CD. JUÁREZ" address="Antonio J. Bermúdez 2151-Local 7, Parque Industrial Antonio J Bermúdez, 32400 Cd Juárez, Chih." />
                <ContactAddress city="TIJUANA" address="Av. Baños de Agua Caliente 3780, 20 de Noviembre, 22100 Tijuana, B.C." />
                <ContactAddress city="CHIHUAHUA" address="Distrito 1, Via Citadela 5701 Edificio Quorum Oficina 301-302, Distrito 1, 31110 Chihuahua, Chih." />
                <ContactAddress city="PANAMÁ" address="Ph Dream Plaza, Av. Centenario, Panamá." muted />
                <ContactAddress city="COSTA RICA" address="Avenida Escazú, AE 205, Piso 2. Escazú, San José. Costa Rica." muted />
                <ContactAddress city="GUATEMALA" address="3ra. Avenida 10-80 Zona 10, Edificio Forum Zona Viva, Torre 2, Oficina 1004, Guatemala." muted />
              </div>
            </div>
            <div style={{ position: 'relative', borderRadius: 6, overflow: 'hidden' }}>
              <img alt="Contacto IHO" src="/images/contacto/contacto.webp" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          </div>
        </section>

        {/* ============ FOOTER ============ */}
        <footer style={{ background: '#1a1916', color: '#c9c4ba' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '30px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <img src="/images/logo-iho-white.png" alt="IHO" style={{ height: 30, display: 'block' }} />
            <div style={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: 13, color: '#8a857b' }}>
              © {new Date().getFullYear()} Grupo IHO. Todos los derechos reservados.
            </div>
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
