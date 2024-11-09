import { useState, useEffect, ComponentProps, memo } from 'react'

import clsx from 'clsx'
import Image from 'next/image'
import { twMerge } from 'tailwind-merge'

interface CatBoxProps extends ComponentProps<'div'> {
  imageUrl?: string
  nickName?: string
  isLeader?: boolean
  message?: string
  timestamp?: number
}

const CatBox = memo(
  ({ imageUrl, nickName, isLeader = false, message, timestamp, className }: CatBoxProps) => {
    const [showResult, setShowResult] = useState(false)
    const [result, setResult] = useState('')
    const [fadeOut, setFadeOut] = useState(false)

    useEffect(() => {
      if (message) {
        setResult(message)
        setShowResult(true)
        setFadeOut(false)

        const fadeOutTimer = setTimeout(() => setFadeOut(true), 2000)
        const hideTimer = setTimeout(() => setShowResult(false), 3000)

        return () => {
          clearTimeout(fadeOutTimer)
          clearTimeout(hideTimer)
        }
      }
    }, [message, timestamp])

    return (
      <div
        className={twMerge(
          'relative aspect-square rounded-xl bg-gray-50 bg-opacity-40 p-1',
          className
        )}
      >
        {isLeader && (
          <Image
            src="/images/crown.png"
            alt="리더 왕관"
            width={20}
            height={20}
            className="absolute right-2 top-1 h-4 w-4 md:h-5 md:w-5"
          />
        )}

        {imageUrl && (
          <div className="relative left-1/2 top-0 mt-3 h-[40px] w-full -translate-x-1/2 pl-1 min-[360px]:h-[48px] min-[410px]:h-[56px] md:h-[64px]">
            <Image
              src={imageUrl}
              alt={nickName || '고양이 아바타'}
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>
        )}

        {nickName && (
          <p className="mx-3 flex h-8 items-center justify-center text-center font-galmuri text-xs leading-tight min-[375px]:text-sm min-[410px]:mx-5 md:mx-6">
            {nickName}
          </p>
        )}

        {showResult && (
          <div
            className={clsx(
              'duration-2000 absolute left-0 top-[-18px] w-full break-keep rounded-[100px] border-[1.5px] border-gray-100 bg-white px-2 py-1 text-center font-galmuri text-xs leading-4 text-black transition-opacity min-[360px]:text-sm',
              {
                'opacity-0': fadeOut,
                'opacity-100': !fadeOut,
              }
            )}
          >
            {result}
          </div>
        )}
      </div>
    )
  }
)

CatBox.displayName = 'CatBox'

export default CatBox
