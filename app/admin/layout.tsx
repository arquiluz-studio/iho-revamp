import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './admin.css'

export const metadata: Metadata = {
  title: { default: 'IHO Admin', template: '%s · IHO Admin' },
  robots: { index: false, follow: false, nocache: true },
}

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-dvh">{children}</body>
    </html>
  )
}
