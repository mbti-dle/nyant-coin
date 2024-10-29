import { memo } from 'react'

import Image from 'next/image'

interface HintsProps {
  fishPrice: number
  prevFishPrice: number
  currentRound: number
  totalRounds: number
  hint: string
  hintResult: string
}

const Hints = memo(
  ({ fishPrice, prevFishPrice, currentRound, totalRounds, hint, hintResult }: HintsProps) => {
    return (
      <div className="relative mb-10 max-h-[156px] min-h-[120px] w-full min-[360px]:h-[156px]">
        <Image src="/images/paper.png" alt="냥트코인 힌트" fill style={{ position: 'absolute' }} />

        <div className="absolute right-1/2 top-1/2 w-full -translate-y-1/2 translate-x-1/2">
          <div className="flex flex-col justify-between min-[375px]:gap-1">
            <p className="mx-7 mb-3 break-keep text-center font-galmuri text-xs min-[375px]:text-sm">
              {hint || '내일 가격 힌트를 기다리는 중입니다...'}
            </p>
            <p className="mb-1 flex items-center justify-center">
              <Image src="/images/fish.png" alt="물고기" width={32} height={32} className="mr-1" />
              <span className="text-xl font-light">
                {fishPrice} 냥코인 {fishPrice > prevFishPrice ? '📈' : '📉'}
              </span>
            </p>
            <p className="mx-11 break-keep text-center font-galmuri text-xs text-gray-400">
              {hintResult || '오늘 힌트에 대한 결과는 내일 알려줍니다.'}
            </p>
          </div>
        </div>
        <div className="absolute bottom-2 right-2 text-xs text-gray-600 min-[390px]:text-sm">
          {currentRound}/{totalRounds}
        </div>
      </div>
    )
  }
)

Hints.displayName = 'Hints'

export default Hints
