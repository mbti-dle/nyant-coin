'use client'

import CopyIcon from '@mui/icons-material/ContentCopySharp'

import Button from '@/components/ui/button'

interface GameIdCopyButtonProps {
  gameId: string
  onCopySuccess?: () => void
}

const GameIdCopyButton = ({ gameId, onCopySuccess }: GameIdCopyButtonProps) => {
  const handleGameIdCopyClick = () => {
    //게임 ID 텍스트 복사 로직

    // 위 로직 성공 시
    onCopySuccess()
  }

  return (
    <Button variant="white" className="mb-4 gap-2" onClick={handleGameIdCopyClick}>
      <span>{gameId}</span>
      <CopyIcon />
    </Button>
  )
}

export default GameIdCopyButton
