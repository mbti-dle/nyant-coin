'use client'

import { useState, useEffect } from 'react'

import ReactDOM from 'react-dom'

import CatBoxGrid from '@/components/features/game/cat-box-grid'
import FishCoinsAssets from '@/components/features/game/fish-coins-assets'
import GameFooter from '@/components/features/game/game-footer'
import Hints from '@/components/features/game/hints'
import Timer from '@/components/features/game/timer'
import ResultModal from '@/components/features/result-modal'
import Toast from '@/components/ui/toast'
import { gameConfig, TOTAL_ROUNDS, FINAL_COIN, SIX_AVATARS } from '@/constants/game'
import useToastStore from '@/store/toast'
import { GameStateModel, TransactionResultModel } from '@/types/game'

interface GamePageProps {
  params: any // 임시
}

const GamePage = ({ params }: GamePageProps) => {
  const { showToast } = useToastStore()

  const [gameState, setGameState] = useState<GameStateModel>({
    coins: gameConfig.INITIAL_COINS,
    fish: gameConfig.INITIAL_FISH_PRICE,
    inputValue: '',
    fishPrice: 240,
    currentRound: 1,
    isModalOpen: false,
  })

  const [transactionResult, setTransactionResult] = useState<TransactionResultModel>({
    message: '',
    key: 0,
  })

  useEffect(() => {
    ReactDOM.preload('/images/background-mobile-3.png', { as: 'image' })
    ReactDOM.preload('/images/background-desktop-3.png', { as: 'image' })
  }, [])

  const handleRoundIncrement = () => {
    setGameState((prev) => {
      if (prev.currentRound === TOTAL_ROUNDS) {
        return { ...prev, isModalOpen: true }
      }
      return { ...prev, currentRound: prev.currentRound + 1 }
    })
  }

  const handleTransaction = (isBuying: boolean, amount: number) => {
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

  const handleModalClose = () => {
    setGameState((prev) => ({ ...prev, isModalOpen: false }))
  }

  const totalCoin = gameState.fish * FINAL_COIN + gameState.coins

  return (
    <main className="flex min-h-dvh w-full justify-center bg-ocean-game-mobile bg-cover bg-fixed bg-top md:bg-ocean-game-desktop">
      <div className="max-w-[420px] p-3 md:pt-[50px]">
        <div className="my-6 flex items-center justify-between">
          <FishCoinsAssets coins={gameState.coins} fish={gameState.fish} />
          <Timer
            onRoundEnd={handleRoundIncrement}
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
        <Toast />
        <ResultModal
          isOpen={gameState.isModalOpen}
          onModalClose={handleModalClose}
          coin={FINAL_COIN}
          totalCoin={totalCoin}
        />
      </div>
      <GameFooter handleTransaction={handleTransaction} />
    </main>
  )
}

export default GamePage
