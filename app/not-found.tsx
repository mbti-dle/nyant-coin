import Image from 'next/image'

import LinkButton from '@/components/ui/link-button'
import catImage from '@/public/images/cat-404.png'

const NotFoundPage = () => {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-3 text-center">
      <h1 className="text-xl">페이지를 찾을 수 없습니다.</h1>
      <Image
        src={catImage}
        alt="404 고양이"
        width={100}
        height={100}
        className="mx-auto my-[50px]"
      />
      <p className="mx-auto mb-20 max-w-[280px] text-center font-galmuri text-lg">
        찾으시는 페이지가 파도를 타고 멀리 떠난 것 같아요. 괜찮아요! 아래 버튼을 눌러 게임 시작
        지점으로 안전하게 돌아가세요.
      </p>
      <LinkButton href="/">홈으로 돌아가기</LinkButton>
    </main>
  )
}

export default NotFoundPage
