import { ComponentProps } from 'react'

import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

interface CatBoxProps extends ComponentProps<'div'> {
  imageUrl?: string
  nickName?: string
  type?: 'mobile' | 'desktop'
  isLeader?: boolean
}

const CatBox = ({
  imageUrl,
  nickName,
  type = 'mobile',
  isLeader = false,
  className,
}: CatBoxProps) => {
  const isMobile = type === 'mobile'

  return (
    <div
      className={twMerge(
        clsx(
          'relative flex flex-col items-center rounded-xl bg-gray-50 bg-opacity-40 pt-3',
          {
            'h-[106px] w-[106px]': isMobile,
            'h-[135px] w-[135px]': !isMobile,
          },
          className
        )
      )}
    >
      {isLeader && (
        <img
          src="/images/crown.png"
          alt="리더 왕관"
          className={clsx('absolute right-2 top-1', {
            'h-4 w-4': isMobile,
            'h-5 w-5': !isMobile,
          })}
        />
      )}
      <div
        className={clsx('flex-shrink-0', {
          'h-[60px] w-[60px]': isMobile,
          'mt-2 h-[76px] w-[76px]': !isMobile,
        })}
      >
        {imageUrl && (
          <img
            src={imageUrl}
            alt={nickName || '고양이 아바타'}
            className="ml-1 h-full w-full object-contain"
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
    </div>
  )
}

export default CatBox
