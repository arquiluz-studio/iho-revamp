'use client'
import { useParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { EVENTS, PRODUCTS, GALLERY_IMAGES, isPast } from '../../data'
import { ProductCard } from '../../ProductCard'

const ACUMIN = '"Acumin Variable Condensed", "Acumin Pro Condensed", "Saira Condensed", sans-serif'
const ARROW = 'M14.9922 0.907227C15.5854 0.343852 16.5108 0.355639 17.1152 1.00195L17.124 1.01074L17.1318 1.02051L25.1328 10.4727L25.1484 10.4922L25.1631 10.5127C25.3539 10.7913 25.4917 11.1077 25.5 11.4648C25.5084 11.8252 25.3839 12.1656 25.1641 12.4883L25.1494 12.5098L25.1328 12.5293L17.1318 21.9814L17.1289 21.9854C16.64 22.5526 15.7236 22.6944 15.1006 22.1924L14.9805 22.084C14.6941 21.7942 14.5482 21.4033 14.5283 21.0264C14.5084 20.6492 14.6124 20.2394 14.8867 19.9209L20.7031 13.0518H2C1.14833 13.0517 0.5 12.3342 0.5 11.501C0.500069 10.6678 1.14836 9.95119 2 9.95117H20.7031L14.8867 3.08008V3.08105C14.614 2.76423 14.5066 2.35345 14.5244 1.97461C14.5423 1.59564 14.6884 1.1958 14.9922 0.907227Z'

const Arr = ({ w = 17, h = 15, flip = false }: { w?: number; h?: number; flip?: boolean }) => (
  <svg viewBox="0 0 26 23" width={w} height={h} fill="currentColor" style={{ display: 'block', flex: 'none', transform: flip ? 'scaleX(-1)' : undefined }}>
    <path d={ARROW} />
  </svg>
)

const DarkField = ({ label, id, type = 'text', placeholder, value, onChange, error }: {
  label: string; id: string; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void; error?: string
}) => (
  <div>
    <label htmlFor={id} style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, letterSpacing: '1.4px', color: 'rgba(255,255,255,0.55)', display: 'block', marginBottom: 9 }}>{label}</label>
    <input
      id={id} type={type} placeholder={placeholder} value={value}
      onChange={e => onChange(e.target.value)}
      className="iho-dark-input"
      style={{ border: 'none', borderBottom: `1px solid ${error ? '#ef483d' : 'rgba(255,255,255,0.22)'}`, background: 'transparent', color: '#fff', padding: '10px 0', fontSize: 16, fontFamily: '"Source Sans 3", sans-serif', width: '100%' }}
    />
    {error && <div style={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: 13, color: '#ef483d', marginTop: 4 }}>{error}</div>}
  </div>
)

const DarkSelect = ({ label, id, value, onChange, options }: {
  label: string; id: string; value: string; onChange: (v: string) => void; options: string[]
}) => (
  <div>
    <label htmlFor={id} style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, letterSpacing: '1.4px', color: 'rgba(255,255,255,0.55)', display: 'block', marginBottom: 9 }}>{label}</label>
    <select
      id={id} value={value} onChange={e => onChange(e.target.value)}
      className="iho-dark-select"
      style={{ border: 'none', borderBottom: '1px solid rgba(255,255,255,0.22)', background: 'transparent', color: '#fff', padding: '10px 0', fontSize: 16, fontFamily: '"Source Sans 3", sans-serif', width: '100%', cursor: 'pointer' }}
    >
      {options.map(o => <option key={o} value={o} style={{ background: '#17150f', color: '#fff' }}>{o}</option>)}
    </select>
  </div>
)

export default function EventoPage() {
  const { slug } = useParams<{ slug: string }>()
  const event = EVENTS.find(e => e.slug === slug)

  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', passType: 'Cortesía general', companions: 'Sin acompañantes' })
  const [agreed, setAgreed] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.6)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!event) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: '"Source Sans 3", sans-serif', fontSize: 18, color: '#17150f' }}>
        Evento no encontrado.{' '}
        <a href="/" style={{ color: '#ef483d', marginLeft: 8 }}>Volver al inicio</a>
      </div>
    )
  }

  const past = isPast(event)
  const navColor = menuOpen || scrolled ? '#2c2920' : '#ffffff'

  function field(key: keyof typeof form) {
    return { value: form[key], onChange: (v: string) => setForm(f => ({ ...f, [key]: v })) }
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Campo requerido'
    if (!form.email.trim()) e.email = 'Campo requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Correo no válido'
    if (!form.phone.trim()) e.phone = 'Campo requerido'
    if (!agreed) e.agreed = 'Debes aceptar el aviso de privacidad'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1200))
    setSubmitting(false)
    setSubmitted(true)
  }

  return (
    <div style={{ width: '100%', overflowX: 'hidden' }}>

      {/* ── HEADER ── */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60, background: scrolled ? '#faf7f1' : 'transparent', borderBottom: `1px solid ${scrolled ? 'rgba(20,18,12,0.08)' : 'rgba(255,255,255,0.14)'}`, transition: 'background 0.4s ease, border-color 0.4s ease' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '18px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/">
            <img src={scrolled ? '/images/logo-iho-black.png' : '/images/logo-iho-white.png'} alt="IHO" style={{ height: 36, display: 'block' }} />
          </a>
          <nav className={menuOpen ? 'iho-nav-open' : ''} style={{ display: 'flex', alignItems: 'center', gap: 34, fontFamily: '"Source Sans 3", sans-serif', fontSize: 15, fontWeight: 500, color: navColor }}>
            <a href="/#eventos" className="iho-nav-link" onClick={() => setMenuOpen(false)}>Lo que viene</a>
            <a href="#productos" className="iho-nav-link" onClick={() => setMenuOpen(false)}>Productos</a>
            <a href="#galeria" className="iho-nav-link" onClick={() => setMenuOpen(false)}>Galería</a>
            <a href="#registro" className="iho-btn" onClick={() => setMenuOpen(false)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#ef483d', color: '#fff', padding: '10px 20px', borderRadius: 30, fontWeight: 600, textDecoration: 'none' }}>
              Solicitar cortesía
              <span className="iho-arrow" style={{ display: 'inline-flex', alignItems: 'center' }}><Arr w={15} h={13} /></span>
            </a>
          </nav>
          <button id="iho-menu-btn" className={menuOpen ? 'is-open' : ''} aria-label="Menú" aria-expanded={menuOpen} onClick={() => setMenuOpen(o => !o)}>
            <span /><span /><span />
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', height: '78vh', minHeight: 600, background: '#0e0e0e', overflow: 'hidden' }}>
        <img alt={event.title} src={event.image} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: past ? 'grayscale(0.3)' : undefined }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(15,13,11,0.9) 0%, rgba(15,13,11,0.42) 48%, rgba(15,13,11,0.18) 100%)', pointerEvents: 'none' }} />

        {/* Badges (align to 1240px container) */}
        <div style={{ position: 'absolute', top: 74, left: 0, right: 0 }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 40px', display: 'flex', gap: 0 }}>
            <div style={{ background: past ? '#17150f' : '#ef483d', color: '#fff', padding: '12px 18px', fontFamily: '"Space Mono", monospace', fontSize: 12, letterSpacing: '1.5px' }}>
              {past ? 'REALIZADO' : 'SAVE THE DATE'}
            </div>
            <div style={{ background: 'rgba(255,255,255,0.92)', color: '#17150f', padding: '12px 18px', fontFamily: '"Space Mono", monospace', fontSize: 12, letterSpacing: '1.5px' }}>
              {event.type}
            </div>
          </div>
        </div>

        {/* Content bottom */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 40px 56px' }}>
            <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 13, letterSpacing: '1.3px', color: 'rgba(255,255,255,0.75)', marginBottom: 16 }}>
              {event.fullDate.toUpperCase()} · {event.city}, MÉXICO · {event.timeRange.split(' — ')[0]}
            </div>
            <h1 style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: 86, lineHeight: 0.9, letterSpacing: '-1px', textTransform: 'uppercase', color: '#fff', margin: '0 0 28px' }}>
              {event.title.split(' ').map((w, i) => {
                if (i === Math.floor(event.title.split(' ').length / 2)) return <><br key="br" />{w} </>
                return `${w} `
              })}
            </h1>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <a href="#registro" className="iho-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#ef483d', color: '#fff', padding: '14px 26px', borderRadius: 32, fontFamily: '"Source Sans 3", sans-serif', fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>
                Solicitar cortesía
                <span className="iho-arrow" style={{ display: 'inline-flex', alignItems: 'center' }}><Arr /></span>
              </a>
              <a href="#productos" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, border: '1px solid rgba(255,255,255,0.4)', color: '#fff', padding: '14px 26px', borderRadius: 32, fontFamily: '"Source Sans 3", sans-serif', fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>
                Ver productos en exhibición
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── BARRA DE DATOS ── */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid rgba(20,18,12,0.1)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '34px 40px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 28 }} className="iho-datos-grid">
          {[
            { label: 'FECHA', value: event.fullDate },
            { label: 'HORARIO', value: event.timeRange },
            { label: 'SEDE', value: event.venue },
            { label: 'ACCESO', value: event.access },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, letterSpacing: '1.4px', color: '#ef483d', marginBottom: 8 }}>{label}</div>
              <div style={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: 16, lineHeight: 1.5, color: '#17150f' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SOBRE EL EVENTO ── */}
      <section style={{ background: '#faf7f1', padding: '88px 40px' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 64, alignItems: 'start' }} className="iho-sobre-grid">
          <div>
            <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 12, letterSpacing: '1.5px', color: '#ef483d', marginBottom: 18 }}>— SOBRE EL EVENTO</div>
            <h2 style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: 48, lineHeight: 0.98, letterSpacing: '-0.5px', textTransform: 'uppercase', margin: '0 0 34px' }}>
              Una noche para<br />recorrer el showroom.
            </h2>
            {event.description.map((p, i) => (
              <p key={i} style={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: 17, lineHeight: 1.7, color: '#4a463d', margin: i < event.description.length - 1 ? '0 0 20px' : 0, textWrap: 'pretty' } as React.CSSProperties}>{p}</p>
            ))}
          </div>
          <div style={{ background: '#ffffff', border: '1px solid rgba(20,18,12,0.1)', borderRadius: 4, padding: 34 }}>
            <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, letterSpacing: '1.2px', color: '#8a8478', marginBottom: 16 }}>EN EL RECORRIDO</div>
            {event.itinerary.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 18, alignItems: 'flex-start', borderTop: '1px solid rgba(20,18,12,0.08)', padding: '16px 0' }}>
                <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, color: '#ef483d', flexShrink: 0, marginTop: 2 }}>{item.num}</span>
                <span style={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: 15, lineHeight: 1.55, color: '#2c2920' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REGISTRO ── */}
      <section id="registro" style={{ background: '#17150f', padding: '88px 40px' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'grid', gridTemplateColumns: '0.85fr 1.15fr', gap: 64, alignItems: 'start' }} className="iho-registro-grid">
          <div>
            <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 12, letterSpacing: '1.5px', color: '#ef483d', marginBottom: 18 }}>— REGISTRO</div>
            <h2 style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: 48, lineHeight: 0.98, letterSpacing: '-0.5px', textTransform: 'uppercase', color: '#ffffff', margin: '0 0 24px' }}>
              Solicita tu<br />cortesía.
            </h2>
            <p style={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: 16, lineHeight: 1.6, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
              El acceso es sin costo con registro previo. Los lugares son limitados; la confirmación llega por correo en un máximo de 48 horas.
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '26px 28px', marginBottom: 26 }} className="iho-form-grid">
              <DarkField label="NOMBRE COMPLETO" id="reg-name" {...field('name')} error={errors.name} />
              <DarkField label="EMPRESA O DESPACHO" id="reg-company" {...field('company')} />
              <DarkField label="CORREO" id="reg-email" type="email" {...field('email')} error={errors.email} />
              <DarkField label="TELÉFONO" id="reg-phone" type="tel" {...field('phone')} error={errors.phone} />
              <DarkSelect label="TIPO DE PASE" id="reg-pass" {...field('passType')} options={['Cortesía general', 'Recorrido guiado', 'Prensa']} />
              <DarkSelect label="ACOMPAÑANTES" id="reg-companions" {...field('companions')} options={['Sin acompañantes', '1 acompañante', '2 acompañantes']} />
            </div>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 28, cursor: 'pointer' }}>
              <input
                type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                style={{ width: 17, height: 17, accentColor: '#ef483d', marginTop: 2, flexShrink: 0, cursor: 'pointer' }}
              />
              <span style={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: 14, lineHeight: 1.5, color: errors.agreed ? '#ef483d' : 'rgba(255,255,255,0.6)' }}>
                He leído y acepto el <a href="#" style={{ color: '#ef483d' }}>aviso de privacidad</a> de Grupo IHO.
              </span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <button
                type="submit"
                disabled={submitting}
                className="iho-btn"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#ef483d', color: '#fff', border: 'none', padding: '16px 30px', borderRadius: 32, fontFamily: '"Source Sans 3", sans-serif', fontWeight: 600, fontSize: 15, cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? 'Enviando…' : 'Enviar registro'}
                {!submitting && <span className="iho-arrow" style={{ display: 'inline-flex', alignItems: 'center' }}><Arr /></span>}
              </button>
              <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, letterSpacing: '1px', color: '#ef483d', opacity: submitted ? 1 : 0, transition: 'opacity 0.35s ease' }}>
                REGISTRO ENVIADO · TE CONFIRMAMOS POR CORREO
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* ── PRODUCTOS EN EXHIBICIÓN ── */}
      <section id="productos" style={{ background: '#ffffff', padding: '88px 40px' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 44 }}>
            <div>
              <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 12, letterSpacing: '1.5px', color: '#ef483d', marginBottom: 18 }}>— CATÁLOGO DEL EVENTO</div>
              <h2 style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: 54, lineHeight: 0.96, letterSpacing: '-0.5px', textTransform: 'uppercase', margin: 0 }}>Productos en<br />exhibición.</h2>
            </div>
            <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, letterSpacing: '1px', color: '#8a8478', flexShrink: 0 }}>{PRODUCTS.length} PIEZAS</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '34px 24px' }} className="iho-productos-grid">
            {PRODUCTS.map((p, i) => (
              <ProductCard key={i} name={p.name} image={p.image} category={p.category} href="#productos" />
            ))}
          </div>
        </div>
      </section>

      {/* ── GALERÍA ── */}
      <section id="galeria" style={{ background: '#f1ece3', padding: '88px 40px' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ marginBottom: 44 }}>
            <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 12, letterSpacing: '1.5px', color: '#ef483d', marginBottom: 18 }}>— GALERÍA</div>
            <h2 style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: 54, lineHeight: 0.96, letterSpacing: '-0.5px', textTransform: 'uppercase', margin: 0 }}>Ediciones<br />anteriores.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }} className="iho-galeria-grid">
            {GALLERY_IMAGES.map((img, i) => (
              <div
                key={i}
                style={{
                  gridColumn: i === 0 ? 'span 2' : undefined,
                  gridRow: i === 0 ? 'span 2' : undefined,
                  aspectRatio: '1/1',
                  borderRadius: 4,
                  overflow: 'hidden',
                  background: '#e7e2d8',
                  cursor: 'pointer',
                }}
              >
                <img alt={`Galería ${i + 1}`} src={img} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.6s cubic-bezier(0.2,0,0.2,1)' }} className="iho-gallery-img" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA DE CIERRE ── */}
      <div style={{ background: '#ef483d', padding: '70px 40px' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 34, flexWrap: 'wrap' }} className="iho-cta-band">
          <h2 style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: 44, lineHeight: 0.98, letterSpacing: '-0.5px', textTransform: 'uppercase', color: '#fff', margin: 0 }}>
            ¿Te interesa alguna pieza<br />para tu proyecto?
          </h2>
          <a
            href="/#contacto"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#17150f', color: '#fff', padding: '16px 30px', borderRadius: 32, fontFamily: '"Source Sans 3", sans-serif', fontWeight: 600, fontSize: 15, textDecoration: 'none', flexShrink: 0 }}
          >
            Hablar con un especialista
            <Arr />
          </a>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#1a1916', color: '#c9c4ba' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '30px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <a href="/">
            <img src="/images/logo-iho-white.png" alt="IHO" style={{ height: 30, display: 'block' }} />
          </a>
          <div style={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: 13, color: '#8a857b' }}>© {new Date().getFullYear()} Grupo IHO. Todos los derechos reservados.</div>
          <div style={{ display: 'flex', gap: 28, fontFamily: '"Source Sans 3", sans-serif', fontSize: 13 }}>
            <a href="#" style={{ color: '#c9c4ba' }}>Aviso de privacidad</a>
            <a href="/#contacto" style={{ color: '#c9c4ba' }}>Contacto</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
