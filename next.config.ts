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
    return [{ source: '/evento/:slug', destination: '/eventos/:slug', permanent: true }]
  },
}

export default withNextIntl(nextConfig)
