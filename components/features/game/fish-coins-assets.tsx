import { memo } from 'react'

import Image from 'next/image'

interface FishCoinsAssetsProps {
  coins: number
  fish: number
}

const FishCoinsAssets = memo(({ coins, fish }: FishCoinsAssetsProps) => {
  return (
    <div className="flex items-center justify-between rounded-full border-[3px] border-gold bg-white md:fixed md:left-0 md:right-0 md:top-0 md:mb-10 md:flex-col md:items-start md:space-y-2 md:rounded-none md:border-none md:bg-transparent md:p-6">
      <div className="flex items-center justify-between space-x-1 px-3 py-2 md:rounded-full md:border-[3px] md:border-gold md:bg-white">
        <Image src="/images/coin.png" alt="코인" width={24} height={24} />
        <span className="font-galmuri">{coins.toLocaleString()}</span>
      </div>
      <div className="flex items-center justify-between space-x-1 px-3 py-2 md:ml-0 md:rounded-full md:border-[3px] md:border-gold md:bg-white">
        <Image src="/images/fish.png" alt="물고기" width={24} height={24} />
        <span className="font-galmuri">{fish.toLocaleString()}</span>
      </div>
    </div>
  )
})

FishCoinsAssets.displayName = 'FishCoinsAssets'

export default FishCoinsAssets
