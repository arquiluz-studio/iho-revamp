import path from 'node:path'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {
  output: 'standalone',
  turbopack: { root: path.resolve('.') },
  experimental: { globalNotFound: true },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' }],
  },
  async redirects() {
    return [
      { source: '/evento/:slug', destination: '/eventos/:slug', permanent: true },
      { source: '/areas', destination: '/soluciones', permanent: true },
      { source: '/areas/:slug', destination: '/soluciones/:slug', permanent: true },
      { source: '/en/areas', destination: '/en/solutions', permanent: true },
      { source: '/en/areas/:slug', destination: '/en/solutions/:slug', permanent: true },
      { source: '/verticales', destination: '/espacios', permanent: true },
      { source: '/nosotros', destination: '/grupo-iho', permanent: true },
      { source: '/en/about', destination: '/en/iho-group', permanent: true },
      { source: '/en/verticals', destination: '/en/spaces', permanent: true },
      { source: '/admin/global/business-lines/:path*', destination: '/admin/global/solutions/:path*', permanent: true },
      { source: '/admin/global/sectors/:path*', destination: '/admin/global/spaces/:path*', permanent: true },
    ]
  },
}

export default withNextIntl(nextConfig)
