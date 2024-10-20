import TrendingFlatIcon from '@mui/icons-material/TrendingFlat'
import Image from 'next/image'
import Link from 'next/link'

import GuideButton from '@/components/features/guide-button'
import Input from '@/components/ui/input'
import LinkButton from '@/components/ui/link-button'
import logo from '@/public/images/logo.png'

const HomePage = ({ params }) => {
  const { gameId = 'N09C14' } = params

  return (
    <>
      <main className="flex min-h-dvh flex-col justify-center bg-sky-mobile bg-cover bg-fixed bg-center md:bg-sky-desktop">
        <div className="mb-20 flex justify-center">
          <Image src={logo} alt="로고" width={280} height={140} />
        </div>

        <div className="flex flex-col items-center gap-4">
          <LinkButton href="/setup/select-days">방 만들기</LinkButton>

          <div className="relative">
            <Input value={''} />
            <Link href={`/setup/user-info/${gameId}`} passHref>
              <TrendingFlatIcon className="absolute right-3 top-1/2 -translate-y-1/2 transform cursor-pointer text-gray-300" />
            </Link>
          </div>

          {/* 오류메세지 */}

          <GuideButton></GuideButton>
        </div>
      </main>
    </>
  )
}

export default HomePage
