import { Metadata, Viewport } from 'next'
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
  title: '냥트코인 - 생선 트레이딩 게임',
  description: '최고의 생선 트레이더는 누구? 생선을 사고팔아 냥코인을 모아보세요!',
  keywords: ['냥트코인', '게임', '생선 트레이드', '트레이딩 게임', '멀티플레이어 게임'],
  verification: {
    google: '1P5OKF9u2FsfsVBFZ47I_BZxoXdaTJX4w_0-TDWxbBw',
  },
  openGraph: {
    title: '냥트코인 - 생선 트레이딩 게임',
    description: '최고의 생선 트레이더는 누구? 생선을 사고팔아 냥코인을 모아보세요!',
    url: 'https://nyantcoin.koyeb.app/',
    siteName: '냥트코인',
    images: [
      {
        url: 'https://nyantcoin.koyeb.app/og.png',
        alt: '냥트코인 로고',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
