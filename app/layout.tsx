import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google'
import { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'

import GlobalUIOverlay from '@/components/layout/global-ui-overlay'
import { PageValidationProvider } from '@/components/provider/page-validation-provider'
import SocketProvider from '@/components/provider/socket-provider'
import './global.css'
import { SITE_URL } from '@/constants/config'

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
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || '',
  },
  openGraph: {
    title: '냥트코인 - 생선 트레이딩 게임',
    description: '최고의 생선 트레이더는 누구? 생선을 사고팔아 냥코인을 모아보세요!',
    url: `${SITE_URL}/`,
    siteName: '냥트코인',
    images: [
      {
        url: `${SITE_URL}/og.png`,
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
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
      <SocketProvider>
        <PageValidationProvider>{children}</PageValidationProvider>
      </SocketProvider>
      <GlobalUIOverlay />
      <div id="modal-root"></div>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ''} />
      <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID || ''} />
    </body>
  </html>
)

export default RootLayout
