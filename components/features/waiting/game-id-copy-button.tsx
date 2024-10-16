'use client'

import CopyIcon from '@mui/icons-material/ContentCopySharp'

import Button from '@/components/ui/button'
import useToastStore from '@/store/toast'

interface GameIdCopyButtonProps {
  gameId: string
}

const GameIdCopyButton = ({ gameId }: GameIdCopyButtonProps) => {
  const { showToast } = useToastStore()

  const handleCopyComplete = () => {
    // 게임 ID 텍스트 복사 성공 시 로직

    showToast('복사되었습니다', 'check')
  }

  const handleGameIdCopyClick = () => {
    //게임 ID 텍스트 복사 로직

    // 위 로직 성공 시
    handleCopyComplete()
  }

  return (
    <Button variant="white" className="gap-2" onClick={handleGameIdCopyClick}>
      <span>{gameId}</span>
      <CopyIcon />
    </Button>
  )
}

export default GameIdCopyButton
