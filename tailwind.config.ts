import type { Config } from 'tailwindcss'

const config: Config = {
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './utils/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00076F',
        blue: '#3369FF',
        gold: '#FFB218',
        black: '#282828',
        white: '#FFFFFF',
        red: '#FF4040',
        gray: {
          50: '#F9FAFB',
          100: '#E3E3E3',
          200: '#A1A1A1',
          300: '#626262',
          400: '#525F70',
          500: '#545F71',
        },
      },
      fontFamily: {
        galmuri: ['var(--font-galmuri)', 'sans-serif'],
        neodgm: ['var(--font-neodgm)', 'sans-serif'],
      },
      backgroundImage: {
        'sky-desktop': "url('/images/background-desktop-1.png')",
        'sky-mobile': "url('/images/background-mobile-1.png')",
        'ocean-game-desktop': "url('/images/background-desktop-3.png')",
        'ocean-game-mobile': "url('/images/background-mobile-3.png')",
      },
    },
  },
  plugins: [],
}

export default config
