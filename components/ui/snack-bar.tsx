import React from 'react'

import { twMerge } from 'tailwind-merge'

import { RefreshCwIcon, WifiOffIcon } from '@/components/icons'
import { useSnackBarStore } from '@/store/snack-bar'
import { SnackBarType } from '@/types/ui-types'

interface SnackBarProps {
  isVisible?: boolean
  message?: string
  type?: SnackBarType | null
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

const SnackBar = ({
  isVisible: propIsVisible,
  message: propMessage,
  type: propType,
  icon: propIcon,
  action: propAction,
  className,
}: SnackBarProps) => {
  const { snackBar } = useSnackBarStore()

  // props가 있으면 props 사용, 없으면 store 사용 (범용성 유지)
  const isVisible = propIsVisible ?? snackBar.isVisible
  const message = propMessage ?? snackBar.message
  const type = propType ?? snackBar.type

  if (!isVisible) return null

  // 타입별 기본 아이콘 및 액션 설정
  let icon = propIcon
  let action = propAction

  if (!icon && type) {
    switch (type) {
      case 'reconnecting':
        icon = <RefreshCwIcon className="h-5 w-5 animate-spin text-yellow-400" />
        break
      case 'error':
        icon = <WifiOffIcon className="text-red-500" size={24} />
        break
    }
  }

  // 네트워크 에러 시 기본 액션 (나가기)
  if (!action && (type === 'error' || type === 'reconnecting')) {
    action = {
      label: '나가기',
      onClick: () => (window.location.href = '/'),
    }
  }

  return (
    <div
      className={twMerge(
        'animate-in fade-in slide-in-from-top fixed left-1/2 top-24 z-[100] flex h-12 max-w-[90%] -translate-x-1/2 items-center gap-3 rounded-lg bg-gray-500 bg-opacity-80 px-4 py-3 shadow-lg duration-300',
        className
      )}
    >
      <div className="flex items-center gap-2">
        {icon && <div className="flex items-center justify-center">{icon}</div>}
        <span className="whitespace-nowrap font-galmuri text-sm text-white min-[410px]:text-base">
          {message}
        </span>
      </div>

      {action && (
        <button
          onClick={() => action?.onClick()}
          className="whitespace-nowrap rounded-md bg-white px-3 py-1 font-galmuri text-xs text-gray-800 transition-colors hover:bg-gray-100"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

export default SnackBar
