'use client'

import { ComponentProps, forwardRef } from 'react'

import Input from '@/components/ui/input'

const CountInput = forwardRef<HTMLInputElement, ComponentProps<typeof Input>>(
  ({ maxLength = 10, value, onChange, ...props }, ref) => {
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value
      if (newValue.length <= maxLength && onChange) {
        onChange(event)
      }
    }

    return (
      <div className="relative h-[54px] w-[300px]">
        <Input
          ref={ref}
          value={value}
          onChange={handleInputChange}
          maxLength={maxLength}
          {...props}
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-galmuri text-sm font-bold text-gray-200">
          {value?.length || 0}/{maxLength}
        </span>
      </div>
    )
  }
)

CountInput.displayName = 'CountInput'

export default CountInput
