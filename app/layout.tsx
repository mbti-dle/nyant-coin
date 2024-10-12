import './global.css'
import localFont from 'next/font/local'

const neodgm = localFont({
  src: '../public/fonts/neodgm.woff2',
  variable: '--font-neodgm',
})

const galmuri = localFont({
  src: '../public/fonts/Galmuri9.woff2',
  variable: '--font-galmuri',
})

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="ko">
    <body className={`${neodgm.className} ${galmuri.className}`}>{children}</body>
  </html>
)

export default RootLayout
