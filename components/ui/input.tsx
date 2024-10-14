'use client'

import { ComponentProps } from 'react'

import { twMerge } from 'tailwind-merge'

interface InputProps extends ComponentProps<'input'> {
  value: string
}

const Input = ({ className, value, maxLength = 6, onChange, ...props }: InputProps) => {
  return (
    <div className="relative h-[54px] w-[300px]">
      <input
        maxLength={maxLength}
        className={twMerge(
    'h-full w-full rounded-xl px-4 pr-16 text-lg outline-none bg-white border-2 border-primary text-black placeholder-gray-200',
    className
  )}
        onChange={onChange}
        value={value}
        {...props}
      />
    </div>
  )
}

export default Input
