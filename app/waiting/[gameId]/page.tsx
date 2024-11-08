'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import ChatContainer from '@/components/features/waiting/chat-container'
import GameIdCopyButton from '@/components/features/waiting/game-id-copy-button'
import PlayerGrid from '@/components/features/waiting/player-grid'
import Button from '@/components/ui/button'
import { useSocketNavigation } from '@/hooks/use-socket-navigation'
import { socket } from '@/lib/socket'
import useGameStore from '@/store/game'
import { PlayerModel } from '@/types/game'

const WaitingPage = ({ params }) => {
  const { gameId = 'N09C14' } = params
  const router = useRouter()

  const [players, setPlayers] = useState<PlayerModel[]>([])
  const [playerInfo, setPlayerInfo] = useState<PlayerModel>()
  const [isLeader, setIsLeader] = useState(false)

  const setGameRounds = useGameStore((state) => state.setGameRounds)

  useSocketNavigation(gameId)

  useEffect(() => {
    const handlePlayerInfo = ({ players, playerId }) => {
      const playerInfo = players.filter((player) => player.id === playerId)[0]
      setPlayers(players)
      setPlayerInfo(playerInfo)
    }

    const handleUpdatePlayers = (updatedPlayers: PlayerModel[]) => {
      setPlayers(updatedPlayers)
    }

    const handleGameStarted = ({ totalRounds }) => {
      setGameRounds(totalRounds)
      router.push(`/game/${gameId}`)
    }

    socket.emit('request_player_info', gameId)
    socket.on('player_info', handlePlayerInfo)
    socket.on('update_players', handleUpdatePlayers)
    socket.on('game_started', handleGameStarted)

    return () => {
      socket.off('player_info')
      socket.off('update_players')
      socket.off('game_started')
    }
  }, [gameId, router, setGameRounds])

  useEffect(() => {
    if (players.length > 0 && players[0].id === playerInfo.id) {
      setIsLeader(true)
    }
  }, [players, playerInfo])

  const handleStartClick = () => {
    if (!isLeader) return

    socket.emit('send_notice', {
      gameId,
      notice: '잠시 후 게임이 시작됩니다',
    })

    setTimeout(() => {
      socket.emit('start_game', { gameId })
    }, 2000)
  }
  return (
    <main className="relative mx-auto min-h-screen w-full bg-ocean-game-mobile bg-sea-spaceship-mobile bg-cover bg-fixed bg-top p-3 pt-[10px] md:bg-sea-spaceship-desktop">
      <div className="mx-auto mt-5 max-w-[420px] flex-col items-center justify-center gap-4 p-3 pb-44 md:pt-[50px]">
        <PlayerGrid players={players} />
        <div className="mt-5 flex flex-col items-center justify-center gap-4">
          <GameIdCopyButton gameId={gameId} />
          {isLeader && <Button onClick={handleStartClick}>게임 시작</Button>}
        </div>
      </div>
      <div className="fixed bottom-0 left-0 mx-auto w-full max-w-[420px]">
        <ChatContainer gameId={gameId} player={playerInfo} />
      </div>
    </main>
  )
}

export default WaitingPage
