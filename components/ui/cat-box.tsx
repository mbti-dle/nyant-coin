import { useState, useEffect, ComponentProps } from 'react'

import clsx from 'clsx'
import Image from 'next/image'
import { twMerge } from 'tailwind-merge'

interface CatBoxProps extends ComponentProps<'div'> {
  imageUrl?: string
  nickName?: string
  type?: 'mobile' | 'desktop'
  isLeader?: boolean
  transactionResult?: { message: string; key: number }
}

const CatBox = ({
  imageUrl,
  nickName,
  type = 'mobile',
  isLeader = false,
  transactionResult,
  className,
}: CatBoxProps) => {
  const isMobile = type === 'mobile'
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
        clsx(
          'relative flex flex-col items-center rounded-xl bg-gray-50 bg-opacity-40 pt-3',
          'aspect-square w-full',
          {
            'p-2': isMobile,
            'p-3': !isMobile,
          },
          className
        )
      )}
    >
      {isLeader && (
        <div
          className={clsx('absolute right-2 top-1', {
            'h-4 w-4': isMobile,
            'h-5 w-5': !isMobile,
          })}
        >
          <Image src="/images/crown.png" alt="리더 왕관" layout="fill" objectFit="contain" />
        </div>
      )}
      <div
        className={clsx('relative flex-shrink-0', {
          'h-3/5 w-3/5': isMobile,
          'h-2/3 w-2/3': !isMobile,
        })}
      >
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={nickName || '고양이 아바타'}
            layout="fill"
            objectFit="contain"
          />
        )}
      </div>
      {nickName && (
        <div className="mt-1 flex w-full flex-grow items-center justify-center">
          <p className="w-[80px] break-words px-1 text-center font-galmuri text-sm leading-tight text-black">
            {nickName}
          </p>
        </div>
      )}
      {showResult && (
        <div
          className={clsx(
            'duration-2000 absolute left-0 right-0 top-[-16px] overflow-hidden text-ellipsis whitespace-nowrap rounded-xl bg-white bg-opacity-80 px-1 py-0.5 text-center text-xs text-black transition-opacity',
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

export default CatBox
