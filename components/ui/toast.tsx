'use client'

import Image from 'next/image'
import { twMerge } from 'tailwind-merge'

import { CheckCircleIcon, ErrorOutlineIcon, WifiIcon, WifiOffIcon } from '@/components/icons'
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

const iconConfig: IconConfigModel = {
  coin: '/images/coin.png',
  check: <CheckCircleIcon className="text-white" size={24} />,
  connection: <WifiIcon className="text-white" size={24} />,
  warning: <ErrorOutlineIcon className="text-yellow-400" size={24} />,
  offline: <WifiOffIcon className="text-red-500" size={24} />,
}

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
      <span className="font-galmuri text-sm text-white min-[410px]:text-base">{message}</span>
    </div>
  )
}

export default Toast
