'use client'

import React, { ComponentProps, useCallback, useMemo, useState, useRef, useEffect } from 'react'

import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

interface InputProps extends ComponentProps<'input'> {
  variant?: 'transparent' | 'white'
  maxLength?: number
}

const Input = React.memo(
  ({ variant = 'transparent', className, maxLength = 10, onChange, ...props }: InputProps) => {
    const [length, setLength] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value.replace(/\s/g, '')
        if (newValue.length <= maxLength) {
          setLength(newValue.length)

          const newEvent = {
            ...event,
            target: {
              ...event.target,
              value: newValue,
            },
          } as React.ChangeEvent<HTMLInputElement>

          if (onChange) {
            onChange(newEvent)
          }
        }

        if (inputRef.current) {
          inputRef.current.value = newValue
        }
      },
      [maxLength, onChange]
    )

    useEffect(() => {
      if (inputRef.current) {
        setLength(inputRef.current.value.length)
      }
    }, [])

    const inputClassName = useMemo(
      () =>
        twMerge(
          clsx(
            'h-full w-full rounded-xl px-4 pr-16 text-lg outline-none text-gray-200 placeholder-gray-200',
            {
              'bg-transparent border-2 border-primary': variant === 'transparent',
              'bg-white border-2 border-primary': variant === 'white',
            },
            className
          )
        ),
      [variant, className]
    )

    return (
      <div className="relative h-[54px] w-[300px]">
        <input
          ref={inputRef}
          maxLength={maxLength}
          className={inputClassName}
          onChange={handleChange}
          {...props}
        />
        {variant === 'transparent' && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-200">
            {length}/{maxLength}
          </span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
