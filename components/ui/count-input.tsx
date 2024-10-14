'use client'

import { ComponentProps } from 'react'

import Input from '@/components/ui/input'

interface CountInputProps extends ComponentProps<typeof Input> {}

const CountInput = ({ maxLength = 10, value, onChange, ...props }: CountInputProps) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value
    if (newValue.length <= maxLength && onChange) {
      onChange(event)
    }
  }

  return (
    <div className="relative h-[54px] w-[300px]">
      <Input 
        value={value} 
        onChange={handleInputChange} 
        maxLength={maxLength} 
        {...props} 
      />
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-200">
        {value?.length || 0}/{maxLength}
      </span>
    </div>
  )
}

export default CountInput