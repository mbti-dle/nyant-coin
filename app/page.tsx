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
      <main className="flex h-screen w-full flex-col items-center justify-center gap-8 bg-sky-mobile bg-cover bg-center md:bg-sky-desktop">
        <Image src={logo} alt="로고" width={280} height={140} className="fixed top-[200px]" />

        <div className="fixed bottom-[160px]">
          <LinkButton href="/setup/select-days" className="mb-4">
            방 만들기
          </LinkButton>

          <div className="fixed bottom-[105px] left-[50%] translate-x-[-50%]">
            <Input value={''} />
            <Link href={`/setup/user-info/${gameId}`} passHref>
              <TrendingFlatIcon className="absolute right-3 top-1/2 -translate-y-1/2 transform cursor-pointer text-gray-300" />
            </Link>
          </div>
        </div>
        {/* 오류메세지 */}

        <GuideButton></GuideButton>
      </main>
    </>
  )
}

export default HomePage
