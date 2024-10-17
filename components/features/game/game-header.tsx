import { memo } from 'react'

import Image from 'next/image'

interface GameHeaderProps {
  coins: number
  fish: number
}

const GameHeader = memo(({ coins, fish }: GameHeaderProps) => {
  return (
    <header className="md:z-9 mb-6 flex justify-between text-[16px] text-black md:fixed md:left-0 md:right-0 md:top-0 md:mb-10 md:p-6">
      <div className="flex items-center md:flex-col md:items-start md:space-y-2">
        <div className="flex items-center justify-between rounded-full border-2 border-gold bg-white px-3 py-2">
          <div className="flex items-center space-x-1">
            <Image src="/images/coin.png" alt="코인" width={24} height={24} />
            <span className="leading-[22px]">{coins.toLocaleString()}</span>
          </div>
        </div>
        <div className="ml-2 flex items-center justify-between rounded-full border-2 border-gold bg-white px-3 py-2 md:ml-0">
          <div className="flex items-center space-x-1">
            <Image src="/images/fish.png" alt="물고기" width={24} height={24} />
            <span className="leading-[22px]">{fish.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </header>
  )
})

GameHeader.displayName = 'GameHeader'

export default GameHeader
