import type { Config } from 'tailwindcss'

const config: Config = {
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
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
        },
      },
      fontFamily: {
        galmuri9: ['Galmuri9', 'sans-serif'],
        neodgm: ['Neodgm', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
