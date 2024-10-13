'use client'

import { ComponentProps } from 'react'

import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

interface NameInputProps extends ComponentProps<'input'> {
  maxLength?: number
  value: string
}

const NameInput = ({ className, maxLength = 10, value, onChange, ...props }: NameInputProps) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value.replace(/\s/g, '')
    if (newValue.length <= maxLength && onChange) {
      onChange({
        ...event,
        target: { ...event.target, value: newValue },
      } as React.ChangeEvent<HTMLInputElement>)
    }
  }

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
        maxLength={maxLength}
        className={inputClassName}
        onChange={handleInputChange}
        value={value}
        {...props}
      />
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-200">
        {value.length}/{maxLength}
      </span>
    </div>
  )
}

export default NameInput
