'use client'

import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import Image from 'next/image'
import { twMerge } from 'tailwind-merge'

import useToastStore from '@/store/toast'
import { ToastIconType } from '@/types/ui-types'

interface ToastProps {
  className?: string
}

interface ToastIconProps extends ToastProps {
  icon: ToastIconType
}

interface IconConfigModel {
  [key: string]: string | React.ReactNode
}

// 토스트 아이콘 설정 객체
// coin: 코인 아이콘 이미지 경로 | check: 체크 아이콘 컴포넌트
const iconConfig: IconConfigModel = {
  coin: '/images/coin.png',
  check: <CheckCircleIcon className="text-white" />,
}

// 토스트 아이콘 컴포넌트
const ToastIcon = ({ icon, className }: ToastIconProps) => {
  const iconContent = iconConfig[icon] || ''

  if (icon === 'coin') {
    return (
      <Image
        src={iconContent as string}
        alt={`${icon} icon`}
        width={24}
        height={24}
        className={className}
      />
    )
  }

  return <div className={className}>{iconContent}</div>
}

// 토스트 전체 컴포넌트
const Toast = ({ className = '' }: ToastProps) => {
  const { isVisible, message, icon } = useToastStore()

  if (!isVisible) {
    return null
  }

  return (
    <div
      className={twMerge(
        'fixed left-1/2 top-24 flex h-12 max-w-[90%] -translate-x-1/2 items-center justify-center whitespace-nowrap rounded-lg bg-gray-500 bg-opacity-80 px-4 py-3',
        className
      )}
    >
      {icon && <ToastIcon icon={icon} className="mr-2" />}
      <span className="font-galmuri text-base text-white">{message}</span>
    </div>
  )
}

export default Toast
