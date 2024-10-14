import { ComponentProps } from 'react'

import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

interface AvatarProps extends ComponentProps<'div'> {
  imageUrl: string
  nickName?: string
  imageWidth?: number
  imageHeight?: number
}

const Avatar = ({
  imageUrl,
  nickName,
  imageWidth = 60,
  imageHeight = 60,
  className,
}: AvatarProps) => {
  return (
    <div
      className={twMerge(
        clsx(
          'flex h-[106px] w-[106px] flex-col items-center rounded-xl bg-gray-50 bg-opacity-40',
          className
        )
      )}
    >
      <div className="flex-shrink-0 pt-4">
        <img
          src={imageUrl}
          alt={nickName || 'avatar'}
          className={`object-contain`}
          style={{ width: `${imageWidth}px`, height: `${imageHeight}px` }}
        />
      </div>
      {nickName && (
        <div className="mt-[-8px] flex w-full flex-grow items-center justify-center">
          <p className="w-[80px] break-words p-0.5 text-center font-galmuri text-sm leading-tight text-black">
            {nickName}
          </p>
        </div>
      )}
    </div>
  )
}

export default Avatar
