'use client'

import CopyIcon from '@mui/icons-material/ContentCopySharp'

import Button from '@/components/ui/button'
import useToastStore from '@/store/toast'

interface GameIdCopyButtonProps {
  gameId: string
}

const GameIdCopyButton = ({ gameId }: GameIdCopyButtonProps) => {
  const { showToast } = useToastStore()

  const handleGameIdCopyClick = async () => {
    if (!gameId || typeof window === 'undefined') {
      return
    }

    navigator.clipboard.writeText(gameId) // 클립보드에 게임 ID 복사
    showToast('복사되었습니다', 'check')
  }

  return (
    <Button variant="white" className="gap-2" onClick={handleGameIdCopyClick}>
      <span className="font-galmuri tracking-widest">{gameId}</span>
      <CopyIcon />
    </Button>
  )
}

export default GameIdCopyButton
