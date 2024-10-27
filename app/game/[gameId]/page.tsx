'use client'

import { useState, useEffect } from 'react'

import ReactDOM from 'react-dom'

import FishCoinsAssets from '@/components/features/game/fish-coins-assets'
import GameFooter from '@/components/features/game/game-footer'
import Hints from '@/components/features/game/hints'
import Timer from '@/components/features/game/timer'
import ResultModal from '@/components/features/result-modal'
import PlayerGrid from '@/components/features/waiting/player-grid'
import Toast from '@/components/ui/toast'
import { gameConfig, FINAL_COIN } from '@/constants/game'
import { socket } from '@/lib/socket'
import useGameStore from '@/store/game'
import useToastStore from '@/store/toast'
import { GameStateModel, TransactionResultModel, PlayerModel, TransactionType } from '@/types/game'

const INITIAL_GAME_STATE: Omit<GameStateModel, 'players'> = {
  coins: gameConfig.INITIAL_COINS,
  fish: gameConfig.INITIAL_FISH,
  inputValue: '',
  fishPrice: gameConfig.INITIAL_FISH_PRICE,
  currentRound: 1,
  isModalOpen: false,
}

const INITIAL_PLAYER_STATE: PlayerModel[] = []

const GamePage = () => {
  const [gameState, setGameState] = useState<Omit<GameStateModel, 'players'>>(INITIAL_GAME_STATE)
  const [players, setPlayers] = useState<PlayerModel[]>(INITIAL_PLAYER_STATE)
  const { gameId, rounds: totalRounds } = useGameStore()
  const { showToast } = useToastStore()

  const [transactionResult, setTransactionResult] = useState<TransactionResultModel>({
    playerId: null,
    message: '',
  })

  useEffect(() => {
    ReactDOM.preload('/images/background-mobile-3.png', { as: 'image' })
    ReactDOM.preload('/images/background-desktop-3.png', { as: 'image' })

    const initializePlayers = ({ players }: { players: PlayerModel[] }) => {
      setPlayers(players)
    }

    socket.emit('request_players_info', gameId)

    socket.on('players_info', initializePlayers)
    socket.on('update_players', (updatedPlayers: PlayerModel[]) => {
      setPlayers(updatedPlayers)
    })
    socket.on('trade_message', (result: TransactionResultModel) => {
      setTransactionResult(result)
    })

    return () => {
      socket.off('players_info')
      socket.off('update_players')
      socket.off('trade_message')
    }
  }, [gameId])

  const handleRoundIncrement = () => {
    setGameState((prev) => {
      if (prev.currentRound === totalRounds) {
        return { ...prev, isModalOpen: true }
      }
      return { ...prev, currentRound: prev.currentRound + 1 }
    })
  }

  const handleTransaction = (action: TransactionType, amount: number) => {
    setGameState((prevState) => {
      const totalValue = amount * prevState.fishPrice

      socket.emit('trade_update', { gameId, action, amount })

      if (action === 'buy' && totalValue > prevState.coins) {
        showToast('보유 코인이 부족합니다', 'check')
        return prevState
      } else if (action === 'sell' && amount > prevState.fish) {
        showToast('보유 생선이 부족합니다', 'check')
        return prevState
      }

      return {
        ...prevState,
        coins: action === 'buy' ? prevState.coins - totalValue : prevState.coins + totalValue,
        fish: action === 'buy' ? prevState.fish + amount : prevState.fish - amount,
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
            isLastRound={gameState.currentRound === totalRounds}
            currentRound={gameState.currentRound}
          />
        </div>
        <Hints
          fishPrice={gameState.fishPrice}
          currentRound={gameState.currentRound}
          totalRounds={totalRounds}
        />
        <PlayerGrid players={players} transactionResult={transactionResult} />
        <Toast />
        <ResultModal
          isOpen={gameState.isModalOpen}
          onModalClose={handleModalClose}
          coin={FINAL_COIN}
          totalCoin={totalCoin}
        />
      </div>
      <GameFooter onTransaction={handleTransaction} />
    </main>
  )
}

export default GamePage
