import Button from '@/components/ui/button'
import Input from '@/components/ui/input'

const GameFooter = ({ inputValue, handleInputChange, handleBuy, handleSell, isInputEmpty }) => {
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
          className="text-galmuri flex-1 text-primary"
          onClick={handleBuy}
          disabled={isInputEmpty}
        >
          사기
        </Button>
        <Button
          variant="primary"
          className="text-galmuri flex-1 text-white"
          onClick={handleSell}
          disabled={isInputEmpty}
        >
          팔기
        </Button>
      </div>
    </div>
  )
}

export default GameFooter
