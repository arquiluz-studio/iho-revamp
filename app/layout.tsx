import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Grupo IHO — Todo el proyecto, un solo proveedor',
  description:
    'Grupo empresarial latinoamericano de interiorismo corporativo, industrial, comercial y residencial. Soluciones arquitectónicas y de iluminación en LATAM.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
