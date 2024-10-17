import { useState, useEffect, useMemo, ComponentProps } from 'react'

import Image from 'next/image'
import { twMerge } from 'tailwind-merge'

interface CatBoxProps extends ComponentProps<'div'> {
  imageUrl?: string
  nickName?: string
  type?: 'mobile' | 'desktop'
  isLeader?: boolean
  transactionResult?: { message: string; key: number }
}

const CatBox: React.FC<CatBoxProps> = ({
  imageUrl,
  nickName,
  type = 'mobile',
  isLeader = false,
  transactionResult,
  className,
}) => {
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

  const containerClasses = twMerge(
    'relative flex flex-col items-center rounded-xl bg-gray-50 bg-opacity-40 pt-3',
    isMobile ? 'h-[106px] w-[106px]' : 'h-[135px] w-[135px]',
    className
  )

  const imageClasses = useMemo(() => {
    const baseClasses = 'flex-shrink-0'
    return isMobile ? `${baseClasses} h-[60px] w-[60px]` : `${baseClasses} mt-2 h-[76px] w-[76px]`
  }, [isMobile])

  const resultClasses = useMemo(() => {
    const baseClasses =
      'absolute left-0 right-0 top-[-16px] overflow-hidden text-ellipsis whitespace-nowrap rounded-xl bg-white bg-opacity-80 px-1 py-0.5 text-center text-xs text-black transition-opacity duration-2000'
    return `${baseClasses} ${fadeOut ? 'opacity-0' : 'opacity-100'}`
  }, [fadeOut])

  return (
    <div className={containerClasses}>
      {isLeader && (
        <Image
          src="/images/crown.png"
          alt="리더 왕관"
          width={isMobile ? 16 : 20}
          height={isMobile ? 16 : 20}
          className="absolute right-2 top-1"
        />
      )}
      <div className={imageClasses}>
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={nickName || '고양이 아바타'}
            width={isMobile ? 60 : 76}
            height={isMobile ? 60 : 76}
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
      {showResult && <div className={resultClasses}>{result}</div>}
    </div>
  )
}

export default CatBox
