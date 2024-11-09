import CatBox from '@/components/ui/cat-box'
import { PlayerModel, TransactionResultModel } from '@/types/game'

interface PlayerGridProps {
  players: PlayerModel[]
  transactionResult?: TransactionResultModel
}

const PlayerGrid = ({ players, transactionResult }: PlayerGridProps) => {
  const MAX_PLAYERS = 6

  const playerSlots = Array(MAX_PLAYERS)
    .fill(null)
    .map((_, index) => {
      const player = players[index] || { id: '', nickname: '', character: '', score: 0 }
      return {
        ...player,
      }
    })

  return (
    <div className="grid grid-cols-3 gap-2 min-[440px]:max-w-[400px] md:max-w-[445px] md:gap-4">
      {playerSlots.map((player, index) => (
        <CatBox
          key={index}
          imageUrl={player.character && `/images/cat-${player.character}.png`}
          nickName={player.nickname}
          isLeader={index === 0}
          message={
            player.id === transactionResult?.playerId ? transactionResult.message : undefined
          }
          timestamp={transactionResult?.timestamp}
        />
      ))}
    </div>
  )
}

export default PlayerGrid
