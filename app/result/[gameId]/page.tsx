'use client'

import Image from 'next/image'

import LinkButton from '@/components/ui/link-button'
import ConfettiComponent from '@/lib/confetti'
import cat from '@/public/images/cat-4.png'
import coin from '@/public/images/coin.png'
import useToastStore from '@/store/toast'

const dummyData = [
  { userId: '세상은1등만기억해요', totalCoin: 100000 },
  { userId: '억울하면', totalCoin: 200000 },
  { userId: '다음에', totalCoin: 300000 },
  { userId: '1등하던가', totalCoin: 400000 },
  { userId: '세상은잔인한거야', totalCoin: 500000 },
  { userId: '2등도몰라3등도몰라', totalCoin: 600000 },
]

const ResultPage = ({ params }) => {
  const { gameId = 'N09C14' } = params
  const { showToast } = useToastStore()

  const handleButtonClick = () => {
    const targetUserId = dummyData[0].userId
    const userRank = dummyData.findIndex((user) => user.userId === targetUserId) + 1

    const resultText = `🏆 냥트코인 게임 결과 🏆 
🥇 ${dummyData[0].userId} - ${dummyData[0].totalCoin} 냥코인
🥈 ${dummyData[1].userId} - ${dummyData[1].totalCoin} 냥코인
🥉 ${dummyData[2].userId} - ${dummyData[2].totalCoin} 냥코인
😺 ${dummyData[3].userId} - ${dummyData[3].totalCoin} 냥코인
😸 ${dummyData[4].userId} - ${dummyData[4].totalCoin} 냥코인
😹 ${dummyData[5].userId} - ${dummyData[5].totalCoin} 냥코인
    
🐱 '${targetUserId}' 님은 ${userRank}등을 차지했습니다! 🐟
🔗 https://nyantcoin.koyeb.app
최고의 생선 트레이더는 누구? 생선을 사고팔아 냥코인을 모아보세요!`

    navigator.clipboard.writeText(resultText)
    showToast('복사 완료! 친구에게 공유해 보세요', 'check')
  }

  return (
    <>
      <main className="flex min-h-dvh flex-col items-center justify-center">
        <div className="relative ml-1 flex h-[100px] w-[100px] items-center justify-center md:h-[150px] md:w-[150px]">
          <Image src={cat} alt="고양이" fill />
        </div>
        <ul className="mb-10 mt-6 w-full max-w-[300px] font-galmuri md:px-0">
          {dummyData.map((user, index) => (
            <li key={index} className="mb-2 flex items-center gap-3">
              <span className="w-1/12 text-center font-neodgm text-gray-300">{index + 1}</span>
              <span className="w-8/12 text-left text-gray-800">{user.userId}</span>
              <div className="flex w-3/12 items-center justify-end gap-1">
                <div className="relative h-[16px] w-[16px] shrink-0">
                  <Image src={coin} alt="코인" fill />
                </div>
                <span className="text-sm text-gray-300">{user.totalCoin}</span>
              </div>
            </li>
          ))}
        </ul>
        <LinkButton href={`/waiting/${gameId}`} className="flex flex-col items-center">
          대기실 이동하기
        </LinkButton>

        <button onClick={handleButtonClick} className="mt-4 font-galmuri text-sm text-blue">
          결과 복사하기
        </button>
        <ConfettiComponent />
      </main>
    </>
  )
}

export default ResultPage
