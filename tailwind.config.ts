import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'iho-red': '#ef483d',
        'iho-bg': '#faf7f1',
        'iho-dark': '#17150f',
        'iho-warm': '#f1ece3',
      },
      fontFamily: {
        condensed: ['"Saira Condensed"', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
        body: ['"Source Sans 3"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
