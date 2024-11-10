'use client'

import { useEffect } from 'react'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

import Button from '@/components/ui/button'
import Modal from '@/components/ui/modal'
import { GameResultModel } from '@/types/game'

interface ResultModalProps {
  coin: number
  totalCoin: number
  isOpen: boolean
  onModalClose: () => void
  onGameEnd: () => void
  gameId: string
  gameResults: GameResultModel[] | null
}

const ResultModal = ({
  coin,
  totalCoin,
  isOpen,
  onModalClose,
  onGameEnd,
  gameId,
  gameResults,
}: ResultModalProps) => {
  const router = useRouter()

  useEffect(() => {
    if (isOpen && !gameResults) {
      onGameEnd()
    }
  }, [isOpen, onGameEnd, gameResults])

  const handleResultButtonClick = () => {
    if (gameResults && gameId) {
      router.push(`/result/${gameId}`)
    }
  }

  return (
    <Modal isOpen={isOpen} onModalClose={onModalClose}>
      <div className="mt-8 text-center">
        <div className="mb-3 flex justify-center">
          <Image src="/images/fish.png" alt="생선" width={36} height={36} />
        </div>
        <p className="mb-3 font-galmuri">최종 생선 판매 가격</p>
        <p className="mb-5 text-2xl">{coin} 냥코인</p>
        <p className="mb-6 font-galmuri text-sm text-gray-400">
          (보유 생선은 시세에 맞게 <br />
          모두 판매 되었습니다.)
        </p>
        <p className="mb-8 flex items-center justify-center font-galmuri">
          최종 냥코인
          <Image src="/images/coin.png" alt="코인" width={24} height={24} className="ml-2 mr-2" />
          {totalCoin}
        </p>
        <div className="mt-4 flex justify-center text-xl">
          <Button onClick={handleResultButtonClick} disabled={!gameResults} className="mb-8">
            {gameResults ? '결과 보러가기' : '결과 취합중...'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ResultModal
