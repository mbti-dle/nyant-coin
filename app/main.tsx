import Image from 'next/image'

import GuideButton from '@/components/features/guide-button'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import logo from '@/public/images/logo.png'

const MainPage = () => (
  <main className="flex h-screen w-full flex-col items-center justify-center gap-8 bg-sky-mobile bg-cover bg-center md:bg-sky-desktop">
    <Image src={logo} alt="로고" width={280} height={140} className="mt-[50px]" />
    <div className="flex flex-col gap-4">
      <Input />
      <Button className="mb-[105px]" />
    </div>
    //에러문구
    <button onClick={GuideButton}>게임방법</button>
  </main>
)

export default MainPage
