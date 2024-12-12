'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import ChatContainer from '@/components/features/chat/chat-container'
import PlayerReturnStatusModal from '@/components/features/player-return-status-modal'
import GameIdCopyButton from '@/components/features/waiting/game-id-copy-button'
import PlayerGrid from '@/components/features/waiting/player-grid'
import Button from '@/components/ui/button'
import { useSocketNavigation } from '@/hooks/use-socket-navigation'
import { socket } from '@/lib/socket'
import useGameStore from '@/store/game'
import useToastStore from '@/store/toast'
import { PlayerModel } from '@/types/game'

const WaitingPage = ({ params }) => {
  const { gameId = 'N09C14' } = params

  const router = useRouter()

  const [players, setPlayers] = useState<PlayerModel[]>([])
  const [playerInfo, setPlayerInfo] = useState<PlayerModel>()
  const [isLeader, setIsLeader] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isPreparingGame, setIsPreparingGame] = useState(false)
  const [notReturnedPlayersCount, setNotReturnedPlayersCount] = useState(0)

  const showToast = useToastStore((state) => state.showToast)
  const setGameRounds = useGameStore((state) => state.setGameRounds)

  useSocketNavigation(gameId)

  useEffect(() => {
    const handlePlayerInfo = ({ players, playerId }) => {
      if (!playerId) {
        router.replace('/')
        showToast('이미 게임이 시작되었습니다')
        return
      }

      if (!players || players.length === 0) {
        router.replace('/')
        showToast('방이 더이상 존재하지 않습니다')
        return
      }

      const playerInfo = players.filter((player) => player.id === playerId)[0]
      if (!playerInfo) {
        router.replace('/')
        showToast('다시 방에 입장해주세요')
        return
      }

      setPlayers(players)
      setPlayerInfo(playerInfo)
    }

    const handleUpdatePlayers = (updatedPlayers: PlayerModel[]) => {
      setPlayers(updatedPlayers)
    }

    const handleGameStarted = ({ totalRounds }) => {
      setGameRounds(totalRounds)
      router.push(`/game/${gameId}`)
      setIsPreparingGame(false)
    }

    socket.emit('request_player_info', { gameId })
    socket.on('player_info', handlePlayerInfo)
    socket.on('update_players', handleUpdatePlayers)
    socket.on('game_started', handleGameStarted)

    return () => {
      socket.off('player_info')
      socket.off('update_players')
      socket.off('game_started')
    }
  }, [gameId, router, setGameRounds, showToast])

  useEffect(() => {
    if (players.length > 0 && players[0].id === playerInfo.id) {
      setIsLeader(true)
    }
  }, [players, playerInfo])

  useEffect(() => {
    const handleNotReturnedCount = ({ count }) => {
      if (count > 0) {
        setNotReturnedPlayersCount(count)
        setIsModalVisible(true)
      } else {
        if (!isModalVisible) {
          startGame(false)
        }
      }
    }

    socket.on('not_returned_players_count', handleNotReturnedCount)

    return () => {
      socket.off('not_returned_players_count')
    }
  }, [isModalVisible])

  const handleModalConfirm = () => {
    setIsModalVisible(false)
    startGame(true)
  }
  const handleModalClose = () => setIsModalVisible(false)

  const handleStartClick = () => {
    socket.emit('check_not_returned_players', { gameId })
  }

  const startGame = (removePlayers: boolean) => {
    setIsPreparingGame(true)
    socket.emit('send_notice', {
      gameId,
      notice: '잠시 후 게임이 시작됩니다',
    })

    setTimeout(() => {
      socket.emit('start_game', { gameId, removePlayers })
    }, 2000)
  }

  return (
    <main className="relative mx-auto min-h-screen w-full bg-sea-spaceship-mobile bg-cover bg-fixed bg-top p-3 pt-[10px] md:bg-sea-spaceship-desktop">
      <div className="mx-auto mt-3 max-w-[420px] flex-col items-center justify-center gap-4 p-3 pb-44 md:pt-[50px]">
        <PlayerGrid players={players} />
        <div className="mt-3 flex flex-col items-center justify-center gap-3">
          <GameIdCopyButton gameId={gameId} />
          {isLeader && (
            <Button onClick={handleStartClick} disabled={isPreparingGame}>
              게임 시작
            </Button>
          )}
        </div>
      </div>
      <div className="fixed bottom-0 left-0 mx-auto w-full max-w-[420px]">
        <ChatContainer
          gameId={gameId}
          player={playerInfo}
          setIsPreparingGame={setIsPreparingGame}
          className="md:bottom-8"
        />
      </div>
      <PlayerReturnStatusModal
        notReturnedPlayerCount={notReturnedPlayersCount}
        isOpen={isModalVisible}
        onModalConfirm={handleModalConfirm}
        onModalClose={handleModalClose}
      />
    </main>
  )
}

export default WaitingPage
