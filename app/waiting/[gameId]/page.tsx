'use client'

import { useState, useEffect } from 'react'

import ChatContainer from '@/components/features/waiting/chat-container'
import GameIdCopyButton from '@/components/features/waiting/game-id-copy-button'
import PlayerGrid from '@/components/features/waiting/player-grid'
import LinkButton from '@/components/ui/link-button'
import { socket } from '@/lib/socket'
import { PlayerModel } from '@/types/game'

const WaitingPage = ({ params }) => {
  const { gameId = 'N09C14' } = params

  const [players, setPlayers] = useState<PlayerModel[]>([])
  const [currentPlayerId, setCurrentPlayerId] = useState('')
  const [isLeader, setIsLeader] = useState(false)

  useEffect(() => {
    // 처음 대기실 입장 시 대기실 정보 요청
    socket.emit('request_players_info', gameId)
    socket.on('players_info', ({ players, currentPlayerId }) => {
      setPlayers(players)
      setCurrentPlayerId(currentPlayerId)
    })

    // 다른 플레이어 입장 시 대기실 정보 업데이트
    socket.on('update_players', (updatedPlayers) => {
      setPlayers(updatedPlayers)
    })

    return () => {
      socket.off('room_info')
      socket.off('update_players')
    }
  }, [gameId])

  // players의 첫 번째 플레이어(index 0)가 리더
  useEffect(() => {
    if (players.length > 0 && players[0].id === currentPlayerId) {
      setIsLeader(true)
    }
  }, [players, currentPlayerId])

  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-sea-spaceship-mobile bg-cover bg-fixed bg-top p-3 md:bg-sea-spaceship-desktop">
      <div className="flex flex-col items-center justify-center gap-4 pb-44 md:static md:h-auto md:min-h-0 md:justify-center md:pt-0">
        <PlayerGrid players={players} />
        <GameIdCopyButton gameId={gameId} />
        {isLeader && <LinkButton href={`/game/${gameId}`}>게임 시작</LinkButton>}
      </div>

      <ChatContainer />
    </main>
  )
}

export default WaitingPage
