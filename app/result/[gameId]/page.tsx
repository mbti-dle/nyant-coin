'use client'

import { useEffect, useState } from 'react'

import Image from 'next/image'

import LoadingPage from '@/app/loading'
import LinkButton from '@/components/ui/link-button'
import { SITE_URL } from '@/constants/config'
import { useSocket } from '@/hooks/use-socket'
import { useSocketNavigation } from '@/hooks/use-socket-navigation'
import ConfettiComponent from '@/lib/confetti'
import coin from '@/public/images/coin.png'
import useGameStore from '@/store/game'
import useToastStore from '@/store/toast'
import { GameResultModel } from '@/types/game'

const ResultPage = ({ params }) => {
  const { gameId } = params
  const [currentUser, setCurrentUser] = useState<GameResultModel | null>(null)
  const { socket } = useSocket()
  const { playerId: currentPlayerId, results: gameResults } = useGameStore()
  const { showToast } = useToastStore()
  useSocketNavigation(gameId)

  useEffect(() => {
    const currentPlayer = gameResults.find((result) => result.id === currentPlayerId) || null
    setCurrentUser(currentPlayer)
  }, [gameId])

  const handleButtonClick = () => {
    const resultText = `🏆 냥트코인 게임 결과 🏆 
${gameResults
  .map((user, index) => {
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '😺'
    return `${medal} ${user.nickname} - ${user.score.toLocaleString()} 냥코인`
  })
  .join('\n')}
    
🐱 '${currentUser?.nickname}' 님은 ${gameResults.findIndex((result) => result.id === currentUser?.id) + 1}등을 차지했습니다! 🐟
🔗 ${SITE_URL}
최고의 생선 트레이더는 누구? 생선을 사고팔아 냥코인을 모아보세요!`

    navigator.clipboard.writeText(resultText)
    showToast('복사 완료! 친구에게 공유해 보세요', 'check')
  }

  const handleLinkButtonClick = () => {
    socket.emit('back_to_waiting', { gameId })
  }

  if (!gameResults.length) {
    return <LoadingPage />
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center">
      <div className="relative ml-1 flex h-[100px] w-[100px] items-center justify-center md:h-[150px] md:w-[150px]">
        <Image src={`/images/cat-${gameResults[0].character}.png`} alt="고양이" fill />
      </div>
      <ul className="mb-10 mt-6 w-full max-w-[300px] font-galmuri">
        {gameResults.map((user, index) => (
          <li key={user.id} className="mb-2 flex items-center gap-3">
            <span className="w-1/12 text-center font-neodgm text-gray-300">{index + 1}</span>
            <span className="w-8/12 text-left text-gray-800">{user.nickname}</span>
            <div className="flex w-3/12 items-center justify-end gap-1">
              <div className="relative h-[16px] w-[16px] shrink-0">
                <Image src={coin} alt="코인" fill />
              </div>
              <span className="text-sm text-gray-300">{user.score.toLocaleString()}</span>
            </div>
          </li>
        ))}
      </ul>
      <LinkButton
        href={`/waiting/${gameId}`}
        onClick={handleLinkButtonClick}
        className="flex flex-col items-center"
      >
        대기실 이동하기
      </LinkButton>
      <button onClick={handleButtonClick} className="mt-4 font-galmuri text-sm text-blue">
        결과 복사하기
      </button>
      <ConfettiComponent />
    </main>
  )
}

export default ResultPage
