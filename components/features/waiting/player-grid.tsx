import { useEffect, useState } from 'react'

import CatBox from '@/components/ui/cat-box'
import { useGameState } from '@/hooks/game/use-game-state'
import { useSocket } from '@/hooks/socket/core/use-socket'
import { PeerConnectionStateModel, PlayerModel, TransactionResultModel } from '@/types/game'

interface PlayerGridProps {
  players: PlayerModel[]
  transactionResult?: TransactionResultModel
}

interface PlayerMessageProps {
  content: string
  timestamp: number
}

const PlayerGrid = ({ players, transactionResult }: PlayerGridProps) => {
  const [playerMessages, setPlayerMessages] = useState<Record<string, PlayerMessageProps>>({})
  const { connectionStatus } = useSocket()
  const { gameData } = useGameState()
  const localPlayerId = gameData.playerId

  useEffect(() => {
    if (transactionResult?.playerId && transactionResult?.message) {
      setPlayerMessages((prev) => ({
        ...prev,
        [transactionResult.playerId]: {
          content: transactionResult.message,
          timestamp: Date.now(),
        },
      }))
    }
  }, [transactionResult])

  const MAX_PLAYERS = 6

  const playerSlots = Array(MAX_PLAYERS)
    .fill(null)
    .map((_, index) => {
      const player = players[index] || {
        id: '',
        nickname: '',
        character: '',
        score: 0,
        isInWaitingRoom: false,
      }
      return {
        ...player,
      }
    })

  const getPlayerStatus = (player: PlayerModel) => {
    // 1. "나"라면 내 브라우저가 직접 감지한 상태를 반환
    if (player.id === localPlayerId) return connectionStatus

    // 2. "남"이라면 내 연결이 정상일 때만 서버가 공유해준 상태를 표시
    const isLocalOnline =
      connectionStatus === PeerConnectionStateModel.CONNECTED ||
      connectionStatus === PeerConnectionStateModel.CONNECTING

    return isLocalOnline
      ? player.connectionStatus || PeerConnectionStateModel.CONNECTED
      : connectionStatus
  }

  return (
    <div className="grid grid-cols-3 gap-2 min-[440px]:max-w-[400px] md:max-w-[445px] md:gap-4">
      {playerSlots.map((player, index) => {
        const message = player.id ? playerMessages[player.id] : undefined

        return (
          <CatBox
            key={index}
            imageUrl={player.character && `/images/cat-${player.character}.png`}
            nickName={player.nickname}
            isLeader={index === 0}
            message={message?.content}
            messageKey={message?.timestamp}
            className={!player.isInWaitingRoom ? 'opacity-40' : ''}
            connectionStatus={getPlayerStatus(player)}
          />
        )
      })}
    </div>
  )
}

export default PlayerGrid
