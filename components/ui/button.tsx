import { ComponentProps } from 'react'

import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

interface ButtonProps extends ComponentProps<'button'> {
  variant?: 'primary' | 'white'
}

const Button = ({ variant = 'primary', className, children, ...props }: ButtonProps) => {
  return (
    <button
      className={twMerge(
        clsx(
          'flex h-[54px] w-[300px] cursor-pointer items-center justify-center rounded-xl text-lg',
          {
            'bg-primary text-white': variant === 'primary',
            'bg-white text-primary': variant === 'white',
          },
          className
        )
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
