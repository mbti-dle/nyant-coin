import { ComponentProps } from 'react'

import { SvgIconComponent } from '@mui/icons-material'
import { twMerge } from 'tailwind-merge'

interface IconButtonProps extends ComponentProps<'button'> {
  Icon: SvgIconComponent
  label: string
  iconClassName?: string
  sx?: { fontSize: number }
}

const IconButton = ({ Icon, label, iconClassName, className, sx, ...props }: IconButtonProps) => {
  return (
    <button
      className={twMerge('inline-flex items-center justify-center p-2 text-gray-400', className)}
      type="button"
      {...props}
      aria-label={label}
    >
      <Icon className={iconClassName} sx={sx} />
    </button>
  )
}

export default IconButton
