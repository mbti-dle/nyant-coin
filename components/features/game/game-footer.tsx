import { useState, memo } from 'react'

import Button from '@/components/ui/button'
import Input from '@/components/ui/input'

interface GameFooterProps {
  handleTransaction: (isBuying: boolean, amount: number) => void
}

const GameFooter = memo(({ handleTransaction }: GameFooterProps) => {
  const [inputValue, setInputValue] = useState('')

  const handleInputChange = ({ target: { value } }) => {
    if (value === '' || /^\d+$/.test(value)) {
      setInputValue(value)
    }
  }

  const handleBuy = () => {
    if (inputValue) {
      handleTransaction(true, parseInt(inputValue))
      setInputValue('')
    }
  }

  const handleSell = () => {
    if (inputValue) {
      handleTransaction(false, parseInt(inputValue))
      setInputValue('')
    }
  }

  return (
    <div className="mb-4 mt-auto flex gap-4">
      <Input
        className="w-full rounded-full border-none"
        value={inputValue}
        onChange={handleInputChange}
        type="text"
        pattern="\d*"
      />
      <div className="flex w-1/2 gap-4">
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
