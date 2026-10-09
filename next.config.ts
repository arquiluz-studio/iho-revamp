import path from 'node:path'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {
  output: 'standalone',
  turbopack: { root: path.resolve('.') },
  experimental: { globalNotFound: true },
  async redirects() {
    return [{ source: '/evento/:slug', destination: '/eventos/:slug', permanent: true }]
  },
}

export default withNextIntl(nextConfig)
