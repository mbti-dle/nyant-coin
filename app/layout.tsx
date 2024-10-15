import { Metadata } from 'next'
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

export const metadata: Metadata = {
  title: '냥트코인',
  description: '최고의 생선 트레이더는 누구? 생선을 사고팔아 냥코인을 모아보세요!',
  keywords: ['냥트코인', '게임', '생선 트레이드'],
  openGraph: {
    title: '냥트코인',
    description: '최고의 생선 트레이더는 누구? 생선을 사고팔아 냥코인을 모아보세요!',
    url: 'https://nyantcoin.koyeb.app/',
    images: [
      {
        url: '/og.png',
        alt: '냥트코인 로고',
      },
    ],
  },
}

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
