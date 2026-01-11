import React from 'react'

import { twMerge } from 'tailwind-merge'

interface SnackBarProps {
  isVisible: boolean
  message: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

const SnackBar = ({ isVisible, message, icon, action, className }: SnackBarProps) => {
  if (!isVisible) return null

  const handleActionClick = () => {
    action?.onClick()
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
          onClick={handleActionClick}
          className="whitespace-nowrap rounded-md bg-white px-3 py-1 font-galmuri text-xs text-gray-800 transition-colors hover:bg-gray-100"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

export default SnackBar
