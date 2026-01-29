import Image from 'next/image'

import Background from '@/components/ui/background'
import backgroundDesktopImage from '@/public/images/background-desktop-1.png'
import backgroundMobileImage from '@/public/images/background-mobile-1.png'
import loadingImage from '@/public/images/loading.gif'

const LoadingScreen = () => {
  return (
    <main className="flex h-screen w-full flex-col items-center justify-center gap-8">
      <Background desktopImage={backgroundDesktopImage} mobileImage={backgroundMobileImage} />

      <Image src={loadingImage} alt="로딩 중" unoptimized />
      <p className="text-2xl tracking-widest">Loading</p>
    </main>
  )
}

export default LoadingScreen
