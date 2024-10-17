'use client'

import { useState } from 'react'

import CatBoxGrid from '@/components/features/game/catbox-grid'
import GameFooter from '@/components/features/game/game-footer'
import GameHeader from '@/components/features/game/game-header'
import Hints from '@/components/features/game/hints'
import Timer from '@/components/features/game/timer'
import ResultModal from '@/components/features/result-modal'
import Toast from '@/components/ui/toast'
import {
  INITIAL_COINS,
  INITIAL_FISH,
  TOTAL_ROUNDS,
  FINAL_COIN,
  SIX_AVATARS,
} from '@/constants/game-constant'
import useToastStore from '@/store/toast'

const GamePage = ({ params }) => {
  const [gameState, setGameState] = useState({
    coins: INITIAL_COINS,
    fish: INITIAL_FISH,
    inputValue: '',
    fishPrice: 240,
    currentRound: 1,
    isModalOpen: false,
  })

  const [transactionResult, setTransactionResult] = useState({ message: '', key: 0 })
  const { showToast } = useToastStore()

  const totalCoin = gameState.fish * FINAL_COIN + gameState.coins

  const incrementRound = () => {
    setGameState((prev) => {
      if (prev.currentRound === TOTAL_ROUNDS) {
        return { ...prev, isModalOpen: true }
      }
      return { ...prev, currentRound: prev.currentRound + 1 }
    })
  }

  const handleTransaction = (isBuying, amount) => {
    setGameState((prevState) => {
      const totalValue = amount * prevState.fishPrice

      setTransactionResult({
        message: `${amount}마리 ${isBuying ? '사요!' : '팔아요!'}`,
        key: Date.now(),
      })

      if (isBuying && totalValue > prevState.coins) {
        showToast('보유 코인이 부족합니다', 'check')
        return prevState
      } else if (!isBuying && amount > prevState.fish) {
        showToast('보유 생선이 부족합니다', 'check')
        return prevState
      }

      return {
        ...prevState,
        coins: isBuying ? prevState.coins - totalValue : prevState.coins + totalValue,
        fish: isBuying ? prevState.fish + amount : prevState.fish - amount,
      }
    })
  }

  const closeModal = () => {
    setGameState((prev) => ({ ...prev, isModalOpen: false }))
  }

  return (
    <>
      <div>
        <link rel="preload" href="/images/background-mobile-3.png" as="image" />
        <link rel="preload" href="/images/background-desktop-3.png" as="image" />
      </div>
      <div className="fixed inset-0 z-[-1] bg-[url('/images/background-mobile-3.png')] bg-cover bg-center bg-no-repeat md:bg-[url('/images/background-desktop-3.png')]" />
      <main className="relative mx-auto flex h-screen min-h-screen w-full max-w-[375px] flex-col overflow-y-auto px-4 pt-[30px] md:pt-[50px]">
        <div className="flex items-center justify-between">
          <GameHeader coins={gameState.coins} fish={gameState.fish} />
          <Timer
            onTimerEnd={incrementRound}
            isLastRound={gameState.currentRound === TOTAL_ROUNDS}
            currentRound={gameState.currentRound}
          />
        </div>
        <Hints
          fishPrice={gameState.fishPrice}
          currentRound={gameState.currentRound}
          totalRounds={TOTAL_ROUNDS}
        />
        <CatBoxGrid avatars={SIX_AVATARS} transactionResult={transactionResult} />
        <GameFooter handleTransaction={handleTransaction} />
        <Toast />
        <ResultModal
          isOpen={gameState.isModalOpen}
          onModalClose={closeModal}
          coin={FINAL_COIN}
          totalCoin={totalCoin}
        />
      </main>
    </>
  )
}

export default GamePage
