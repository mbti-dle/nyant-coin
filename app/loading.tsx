import Image from 'next/image'

import loadingImage from '@/public/images/loading.gif'

const LoadingPage = () => {
  return (
    <main className="flex h-screen w-full flex-col items-center justify-center gap-8 bg-sky-mobile bg-cover bg-center md:bg-sky-desktop">
      <Image src={loadingImage} alt="로딩 중" />
      <p className="text-2xl tracking-widest">Loading</p>
    </main>
  )
}

export default LoadingPage
