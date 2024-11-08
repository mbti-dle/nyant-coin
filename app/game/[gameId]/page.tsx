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
import { gameConfig } from '@/constants/game'
import { useSocketNavigation } from '@/hooks/use-socket-navigation'
import { socket } from '@/lib/socket'
import useGameStore from '@/store/game'
import useToastStore from '@/store/toast'
import {
  GameStateModel,
  TransactionResultModel,
  PlayerModel,
  TransactionType,
  HintContentModel,
  GameResultModel,
} from '@/types/game'

const GamePage = ({ params }) => {
  const INITIAL_GAME_STATE: GameStateModel = {
    coins: gameConfig.INITIAL_COINS,
    fish: gameConfig.INITIAL_FISH,
    inputValue: '',
    fishPrice: gameConfig.INITIAL_FISH_PRICE,
    currentRound: 1,
    isModalOpen: false,
  }
  const INITIAL_PLAYER_STATE: PlayerModel[] = []
  const INITIAL_HINTS: HintContentModel = { nextRoundHint: '', lastRoundHintResult: '' }

  const [gameState, setGameState] = useState<GameStateModel>(INITIAL_GAME_STATE)
  const [players, setPlayers] = useState<PlayerModel[]>(INITIAL_PLAYER_STATE)
  const [hints, setHints] = useState<HintContentModel>(INITIAL_HINTS)
  const [transactionResult, setTransactionResult] = useState<TransactionResultModel>({
    playerId: null,
    message: '',
  })
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [prevFishPrice, setPrevFishPrice] = useState(gameConfig.INITIAL_FISH_PRICE)
  const [lastFishCoin, setLastFishCoin] = useState(0)
  const [gameResults, setGameResults] = useState<GameResultModel[] | null>(null)

  const { rounds: totalRounds } = useGameStore()
  const { showToast } = useToastStore()
  const { gameId } = params

  useSocketNavigation(gameId)

  useEffect(() => {
    ReactDOM.preload('/images/background-mobile-3.png', { as: 'image' })
    ReactDOM.preload('/images/background-desktop-3.png', { as: 'image' })

    const handlePlayerInitialize = ({
      players,
      playerId,
    }: {
      players: PlayerModel[]
      playerId: string
    }) => {
      setPlayers(players)
      setPlayerId(playerId)
    }

    const handlePlayersUpdate = (updatedPlayers: PlayerModel[]) => {
      setPlayers(updatedPlayers)
    }

    const handleFirstRoundHint = (gameInfo) => {
      if (gameInfo.currentDay === 1) {
        setHints({
          nextRoundHint: gameInfo.nextRoundHint,
          lastRoundHintResult: '',
        })
      }
    }

    const handleLastFishPrice = (newPrice) => {
      setLastFishCoin(newPrice)
      setGameState((prev) => ({ ...prev, isModalOpen: true }))
    }

    const handleTradeMessage = (result: TransactionResultModel) => {
      setTransactionResult(result)
    }

    const handleGameInfoUpdate = (gameInfo) => {
      setPrevFishPrice(gameState.fishPrice)
      setGameState((prev) => ({
        ...prev,
        fishPrice: gameInfo.currentFishPrice,
        currentRound: gameInfo.currentDay,
      }))
      setHints({
        nextRoundHint: gameInfo.nextRoundHint || '',
        lastRoundHintResult: gameInfo.lastRoundHintResult || '',
      })
    }

    const handleGameEnded = ({ results }: { results: GameResultModel[] }) => {
      setGameResults(results)
    }

    socket.emit('request_player_info', gameId)
    socket.emit('request_first_round_hint', { gameId })
    socket.emit('player_ready', { gameId })

    socket.on('player_info', handlePlayerInitialize)
    socket.on('update_players', handlePlayersUpdate)
    socket.on('first_round_hint', handleFirstRoundHint)
    socket.on('last_fish_price', handleLastFishPrice)
    socket.on('trade_message', handleTradeMessage)
    socket.on('update_game_info', handleGameInfoUpdate)
    socket.on('game_ended', handleGameEnded)

    return () => {
      socket.off('player_info')
      socket.off('update_players')
      socket.off('first_round_hint')
      socket.off('last_fish_price')
      socket.off('trade_message')
      socket.off('update_game_info')
      socket.off('game_ended')
    }
  }, [gameId])

  const handleTransaction = (action: TransactionType, amount: number) => {
    setGameState((prevState) => {
      const totalValue = amount * prevState.fishPrice

      socket.emit('trade_fishes', { gameId, action, amount })

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

  const handleGameEnd = () => {
    const finalScore = {
      playerId,
      totalCoin,
    }

    socket.emit('end_game', { gameId, result: finalScore })
  }

  const totalCoin = gameState.fish * lastFishCoin + gameState.coins

  return (
    <main className="relative h-screen min-h-screen w-full flex-col bg-ocean-game-mobile bg-cover bg-fixed p-3 pt-[0px] md:bg-ocean-game-desktop">
      <div className="mx-auto max-w-[420px] flex-col items-center justify-center p-3 md:pt-[50px]">
        <div className="my-6 flex justify-between">
          <div className="flex justify-start">
            <FishCoinsAssets coins={gameState.coins} fish={gameState.fish} />
          </div>
          <div className="ml-auto mt-2">
            <Timer />
          </div>
        </div>
        <Hints
          fishPrice={gameState.fishPrice}
          prevFishPrice={prevFishPrice}
          currentRound={gameState.currentRound}
          totalRounds={totalRounds}
          hint={hints?.nextRoundHint}
          hintResult={hints?.lastRoundHintResult}
        />
        <PlayerGrid players={players} transactionResult={transactionResult} />
        <Toast />
        <ResultModal
          isOpen={gameState.isModalOpen}
          onModalClose={handleModalClose}
          coin={lastFishCoin}
          totalCoin={totalCoin}
          onGameEnd={handleGameEnd}
          gameId={gameId}
          gameResults={gameResults}
        />
        <div className="flex w-full justify-center">
          <GameFooter onTransaction={handleTransaction} />
        </div>
      </div>
    </main>
  )
}

export default GamePage
