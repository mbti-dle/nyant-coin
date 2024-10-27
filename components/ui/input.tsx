'use client'

import { ComponentProps, forwardRef } from 'react'

import { twMerge } from 'tailwind-merge'

interface InputProps extends ComponentProps<'input'> {
  value: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, value, maxLength = 6, onChange, ...props }, ref) => {
    return (
      <div className="relative h-[54px] w-[300px]">
        <input
          ref={ref}
          maxLength={maxLength}
          className={twMerge(
            'h-full w-full rounded-xl border-2 border-primary bg-white px-4 pb-[2px] pr-16 font-galmuri text-lg text-black placeholder-gray-200 outline-none',
            className
          )}
          onChange={onChange}
          value={value}
          {...props}
        />
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
