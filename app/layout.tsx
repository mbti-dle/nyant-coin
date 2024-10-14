import localFont from 'next/font/local'

import Toast from '@/components/ui/toast'
import './global.css'

const neodgm = localFont({
  src: '../public/fonts/Neodgm.woff2',
  variable: '--font-neodgm',
})

const galmuri = localFont({
  src: '../public/fonts/Galmuri9.woff2',
  variable: '--font-galmuri',
})

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="ko">
    <body className={`${neodgm.variable} ${galmuri.variable}`}>
      {children}
      <Toast />
      <div id="modal-root"></div>
    </body>
  </html>
)

export default RootLayout
