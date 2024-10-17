import { memo } from 'react'

import Image from 'next/image'

interface HintsProps {
  fishPrice: number
  currentRound: number
  totalRounds: number
}

const Hints = memo(({ fishPrice, currentRound, totalRounds }: HintsProps) => {
  return (
    <div className="relative mb-6 flex flex-col items-center justify-center bg-[url('/images/paper.png')] bg-[length:100%_100%] bg-center bg-no-repeat px-4 py-2 text-sm font-light text-black md:mt-6">
      <div className="flex flex-col items-center justify-center gap-2 py-2">
        <p className="mb-2 text-[14px] leading-[22px]">
          요리대결 프로그램 냥멍요리사대박! 생선가게에 몰려드는 팬들, 재고부족사태 올까?(🔺상승)
        </p>
        <p className="mb-2 flex items-center">
          <Image src="/images/fish.png" alt="물고기" width={32} height={32} className="mr-1" />
          <span className="text-[20px] font-light">{fishPrice} 냥코인 📈</span>
        </p>
        <p className="mb-2 text-[12px] leading-[18px] text-gray-400">
          냉동창고는 완공됐지만 관리가 제대로 되지 않아 생선 공급에 차질이 생기면서 가격이
          폭등했습니다.
        </p>
      </div>
      <div className="absolute bottom-2 right-2 text-[12px] text-gray-600">
        {currentRound}/{totalRounds}
      </div>
    </div>
  )
})

Hints.displayName = 'Hints'

export default Hints
