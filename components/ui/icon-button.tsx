import { ComponentProps } from 'react'

import { IconType } from 'react-icons'
import { twMerge } from 'tailwind-merge'

interface IconButtonProps extends ComponentProps<'button'> {
  Icon: IconType
  label: string
  iconClassName?: string
  size?: number
}

const IconButton = ({ Icon, label, iconClassName, className, size, ...props }: IconButtonProps) => {
  return (
    <button
      className={twMerge('inline-flex items-center justify-center text-gray-400', className)}
      type="button"
      {...props}
      aria-label={label}
    >
      <Icon className={iconClassName} size={size} />
    </button>
  )
}

export default IconButton
