import { ComponentProps } from 'react'

import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

interface ButtonProps extends ComponentProps<'button'> {
  variant?: 'primary' | 'white'
}

const Button = ({ variant = 'primary', className, children, disabled, ...props }: ButtonProps) => {
  return (
    <button
      className={twMerge(
        clsx(
          'hover:bg-navy flex h-[54px] w-[300px] cursor-pointer items-center justify-center rounded-xl text-lg',
          {
            'bg-primary text-white': variant === 'primary' && !disabled,
            'bg-white text-primary': variant === 'white' && !disabled,
            'cursor-not-allowed bg-gray-100 text-gray-200': disabled,
          },
          className
        )
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
