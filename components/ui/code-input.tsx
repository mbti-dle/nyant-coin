'use client'

import { ComponentProps } from 'react'

import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

interface CodeInputProps extends ComponentProps<'input'> {
  value: string
}

const CodeInput = ({ className, value, onChange, ...props }: CodeInputProps) => {
  const inputClassName = twMerge(
    clsx(
      'h-full w-full rounded-xl px-4 pr-16 text-lg outline-none',
      'bg-white border-2 border-primary text-black placeholder-gray-200'
    ),
    className
  )

  return (
    <div className="relative h-[54px] w-[300px]">
      <input
        maxLength={10}
        className={inputClassName}
        onChange={onChange}
        value={value}
        {...props}
      />
    </div>
  )
}

export default CodeInput
