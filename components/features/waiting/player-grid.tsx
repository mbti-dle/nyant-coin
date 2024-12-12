import { useEffect, useState } from 'react'

import CatBox from '@/components/ui/cat-box'
import { PlayerModel, TransactionResultModel } from '@/types/game'

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
          />
        )
      })}
    </div>
  )
}

export default PlayerGrid
