import { useState, useEffect, ComponentProps, memo } from 'react'

import clsx from 'clsx'
import Image from 'next/image'
import { twMerge } from 'tailwind-merge'

interface CatBoxProps extends ComponentProps<'div'> {
  imageUrl?: string
  nickName?: string
  isLeader?: boolean
  transactionResult?: { message: string; key: number }
}

const CatBox = memo(
  ({ imageUrl, nickName, isLeader = false, transactionResult, className }: CatBoxProps) => {
    const [showResult, setShowResult] = useState(false)
    const [result, setResult] = useState('')
    const [fadeOut, setFadeOut] = useState(false)

    useEffect(() => {
      if (transactionResult?.message) {
        setResult(transactionResult.message)
        setShowResult(true)
        setFadeOut(false)

        const fadeOutTimer = setTimeout(() => setFadeOut(true), 2000)
        const hideTimer = setTimeout(() => setShowResult(false), 3000)

        return () => {
          clearTimeout(fadeOutTimer)
          clearTimeout(hideTimer)
        }
      }
    }, [transactionResult])

    return (
      <div
        className={twMerge(
          'relative flex h-[106px] w-[106px] flex-col items-center rounded-xl bg-gray-50 bg-opacity-40 pt-3 md:h-[135px] md:w-[135px]',
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
        <div className="h-[60px] w-[60px] flex-shrink-0 md:mt-2 md:h-[76px] md:w-[76px]">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={nickName || '고양이 아바타'}
              width={76}
              height={76}
              className="ml-1 h-full w-full translate-y-1 object-contain"
            />
          )}
        </div>
        {nickName && (
          <div className="mt-[-4px] flex w-full flex-grow items-center justify-center">
            <p className="w-[80px] break-words p-0.5 text-center font-galmuri text-sm leading-tight text-black">
              {nickName}
            </p>
          </div>
        )}
        {showResult && (
          <div
            className={clsx(
              'duration-2000 absolute left-0 top-[-16px] line-clamp-2 flex w-full items-center justify-center rounded-[100px] border-[1.5px] border-gray-200 bg-white py-1 text-center text-sm text-black transition-opacity',
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
