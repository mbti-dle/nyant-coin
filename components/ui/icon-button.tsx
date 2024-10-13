import { ComponentProps } from 'react'

import { SvgIconComponent } from '@mui/icons-material'
import { twMerge } from 'tailwind-merge'

interface IconButtonProps extends ComponentProps<'button'> {
  Icon: SvgIconComponent
  iconClassName?: string
}

const IconButton = ({ Icon, iconClassName, className, ...props }: IconButtonProps) => {
  return (
    <button
      className={twMerge('inline-flex items-center justify-center p-2 text-gray-400', className)}
      type="button"
      {...props}
    >
      <Icon className={iconClassName} />
    </button>
  )
}

export default IconButton
