import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import Image from 'next/image'
import { twMerge } from 'tailwind-merge'

import useToastStore from '@/store/use-toast-store'
interface IconConfig {
  [key: string]: string | React.ReactNode
}

const iconConfig: IconConfig = {
  coin: '/images/coin.png',
  check: <CheckCircleIcon className="text-white" />,
}

type ToastIconProps = 'coin' | 'check' // 아이콘 종류

// 토스트 아이콘 컴포넌트
const ToastIcon = ({ icon, className }: { icon: ToastIconProps; className: string }) => {
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
const Toast = ({ className = '', ...props }: { className?: string }) => {
  const { isVisible, message, icon } = useToastStore()

  // 테일윈드 스타일
  const toastClassName = `fixed left-1/2 top-24 flex h-12 -translate-x-1/2 items-center justify-center rounded-lg bg-gray-500 bg-opacity-80 px-4 py-3`
  const messageClassName = `font-galmuri text-base text-white`

  if (!isVisible) return null

  return (
    <div className={twMerge(toastClassName, className)} {...props}>
      {icon && <ToastIcon icon={icon} className="mr-2" />}
      <span className={messageClassName}>{message}</span>
    </div>
  )
}

export default Toast
