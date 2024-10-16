'use client'

import Image from 'next/image'

import LinkButton from '@/components/ui/link-button'
import ConfettiComponent from '@/lib/confetti'
import cat from '@/public/images/cat-4.png'
import coin from '@/public/images/coin.png'
import useToastStore from '@/store/toast'
interface ResultPageProps {
  params: {
    gameId?: string
  }
}

const ResultPage = ({ params }: ResultPageProps) => {
  const { gameId = 'N09C14' } = params
  const { showToast } = useToastStore()

  const handleShowCheckToast = () => {
    showToast('복사 완료! 친구에게 공유해 보세요', 'check')
  }
  const dummyData = [
    { userId: '세상은1등만기억해요', totalCoin: 100000 },
    { userId: '억울하면', totalCoin: 200000 },
    { userId: '다음에', totalCoin: 300000 },
    { userId: '1등하던가', totalCoin: 400000 },
    { userId: '세상은잔인한거야', totalCoin: 500000 },
    { userId: '2등도몰라3등도몰라', totalCoin: 600000 },
  ]

  return (
    <>
      <main className="flex min-h-dvh flex-col items-center justify-center">
        <Image src={cat} alt="로고" width={120} height={100} />
        <div className="mb-10 mt-3 font-galmuri">
          {dummyData.map((user, index) => (
            <ul key={index} className="mb-2 flex items-center">
              <span className="mr-4 w-10 text-center font-neodgm text-gray-300">{index + 1}</span>
              <span className="ml-2 mr-4 w-40 text-left text-gray-800">{user.userId}</span>
              <div className="ml-2 flex w-20 items-center text-right">
                <Image src={coin} alt="코인" width={16} height={16} className="mr-1" />
                <span className="text-sm text-gray-300">{user.totalCoin}</span>
              </div>
            </ul>
          ))}
        </div>
        <LinkButton href={`/waiting/${gameId}`} className="flex flex-col items-center">
          대기실 이동하기
        </LinkButton>

        <button onClick={handleShowCheckToast} className="mt-4 font-galmuri text-sm text-blue">
          결과 복사하기
        </button>
        <ConfettiComponent />
      </main>
    </>
  )
}

export default ResultPage
