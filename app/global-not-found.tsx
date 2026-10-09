import type { Metadata } from 'next'
import { ACUMIN, SANS } from '@/components/ui/tokens'
import './globals.css'

export const metadata: Metadata = {
  title: '404 — IHO',
}

export default function GlobalNotFound() {
  return (
    <html lang="es">
      <body>
        <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, background: '#faf7f1', color: '#2c2920', fontFamily: SANS, textAlign: 'center', padding: 40 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-iho-black.png" alt="IHO" style={{ height: 40 }} />
          <h1 style={{ fontFamily: ACUMIN, fontSize: 54, margin: 0, textTransform: 'uppercase' }}>404</h1>
          <p style={{ margin: 0 }}>No encontramos esta página. · We couldn’t find this page.</p>
          <a href="/" className="iho-btn" style={{ background: '#ef483d', color: '#fff', padding: '10px 22px', borderRadius: 30, fontWeight: 600, textDecoration: 'none' }}>
            Volver al inicio · Back home
          </a>
        </main>
      </body>
    </html>
  )
}
