'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import ChatContainer from '@/components/features/waiting/chat-container'
import GameIdCopyButton from '@/components/features/waiting/game-id-copy-button'
import PlayerGrid from '@/components/features/waiting/player-grid'
import Button from '@/components/ui/button'
import { socket } from '@/lib/socket'
import useGameStore from '@/store/game'
import { PlayerModel } from '@/types/game'

const WaitingPage = ({ params }) => {
  const { gameId = 'N09C14' } = params
  const router = useRouter()
  const setGameId = useGameStore((state) => state.setGameId)
  const setGameRounds = useGameStore((state) => state.setGameRounds)
  // const addSystemMessage = useChatStore((state) => state.addSystemMessage)

  const [players, setPlayers] = useState<PlayerModel[]>([])
  const [playerInfo, setPlayerInfo] = useState<PlayerModel>()
  const [isLeader, setIsLeader] = useState(false)

  useEffect(() => {
    socket.emit('request_player_info', gameId)
    socket.on('player_info', ({ players, playerId }) => {
      const playerInfo = players.filter((player) => player.id === playerId)[0]
      setPlayers(players)
      setPlayerInfo(playerInfo)
    })

    socket.on('update_players', (updatedPlayers) => {
      setPlayers(updatedPlayers)
    })

    const handleSystemMessage = (message) => {
      // setNoticeMessage(prev => ...prev, { type: 'system', message }])
    }

    const handleGameStarted = ({ totalRounds }) => {
      setGameRounds(totalRounds)
      router.push(`/game/${gameId}`)
    }

    socket.on('receive_system_message', handleSystemMessage)
    socket.on('game_started', handleGameStarted)
    // socket.on('SERVER_ERROR', () =>
    //   addSystemMessage('서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.')
    // )
    // socket.on('HINTS_NOT_LOADED', () =>
    //   addSystemMessage('게임 데이터를 불러오는 중 오류가 발생했습니다.')
    // )
    // socket.on('INITIALIZATION_ERROR', () => addSystemMessage('게임 초기화 중 오류가 발생했습니다.'))
    // socket.on('NETWORK_ERROR', () => addSystemMessage('네트워크 연결이 불안정합니다.'))

    return () => {
      socket.off('player_info')
      socket.off('update_players')
      socket.off('game_started', handleGameStarted)
      // socket.off('receive_system_message', handleSystemMessage)
      // socket.off('SERVER_ERROR')
      // socket.off('HINTS_NOT_LOADED')
      // socket.off('INITIALIZATION_ERROR')
      // socket.off('NETWORK_ERROR')
    }
    // }, [gameId])
  }, [gameId, router, setGameRounds])

  useEffect(() => {
    if (players.length > 0 && players[0].id === playerInfo.id) {
      setIsLeader(true)
    }
  }, [players, playerInfo])

  const handleStartClick = () => {
    if (!isLeader) return

    socket.emit('system_message', {
      gameId,
      message: '잠시 후 게임이 시작됩니다',
    })

    setTimeout(() => {
      socket.emit('start_game', { gameId })
    }, 2000)
  }

  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-sea-spaceship-mobile bg-cover bg-fixed bg-top p-3 md:bg-sea-spaceship-desktop">
      <div className="flex flex-col items-center justify-center gap-4 pb-44 md:static md:h-auto md:min-h-0 md:justify-center md:pt-0">
        <PlayerGrid players={players} />
        <GameIdCopyButton gameId={gameId} />
        {isLeader && <Button onClick={handleStartClick}>게임 시작</Button>}
      </div>

      <ChatContainer gameId={gameId} player={playerInfo} />
    </main>
  )
}

export default WaitingPage
