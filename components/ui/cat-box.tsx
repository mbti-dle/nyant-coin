import { ComponentProps } from 'react'

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
  const containerSize = isMobile ? 'h-[106px] w-[106px]' : 'h-[135px] w-[135px]'
  const imgSize = isMobile ? 'w-[60px] h-[60px]' : 'w-[76px] h-[76px]'
  const crownSize = isMobile ? 'w-4 h-4' : 'w-5 h-5'
  const imageMargin = isMobile ? '' : 'mt-2'

  return (
    <div
      className={twMerge(
        `flex flex-col items-center rounded-xl bg-gray-50 bg-opacity-40 pt-3 ${containerSize} relative`,
        className
      )}
    >
      {isLeader && (
        <img
          src="/images/crown.png"
          alt="Leader Crown"
          className={`absolute right-2 top-1 ${crownSize}`}
        />
      )}
      <div className={`flex-shrink-0 ${imgSize} ${imageMargin}`}>
        {imageUrl && (
          <img
            src={imageUrl}
            alt={nickName || 'avatar'}
            className={`object-contain ${imgSize} ml-1`}
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
