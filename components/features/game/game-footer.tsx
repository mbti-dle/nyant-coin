import { useState, memo } from 'react'

import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { TransactionType } from '@/types/game'

interface GameFooterProps {
  onTransaction: (action: TransactionType, amount: number) => void
}

const GameFooter = memo(({ onTransaction }: GameFooterProps) => {
  const [inputValue, setInputValue] = useState('')

  const handleInputChange = ({ target: { value } }) => {
    if (value === '' || /^\d+$/.test(value)) {
      setInputValue(value)
    }
  }

  const handleBuy = () => {
    if (inputValue) {
      onTransaction('buy', parseInt(inputValue))
      setInputValue('')
    }
  }

  const handleSell = () => {
    if (inputValue) {
      onTransaction('sell', parseInt(inputValue))
      setInputValue('')
    }
  }

  return (
    <div className="fixed bottom-1 flex w-full max-w-[420px] gap-2 p-3">
      <Input
        className="rounded-full border-none"
        value={inputValue}
        onChange={handleInputChange}
        type="text"
        pattern="\d*"
      />
      <div className="flex w-1/2 gap-2">
        <Button
          variant="white"
          className="flex-1 text-primary"
          onClick={handleBuy}
          disabled={inputValue === ''}
        >
          사기
        </Button>
        <Button
          variant="primary"
          className="flex-1 text-white"
          onClick={handleSell}
          disabled={inputValue === ''}
        >
          팔기
        </Button>
      </div>
    </div>
  )
})

GameFooter.displayName = 'GameFooter'

export default GameFooter
