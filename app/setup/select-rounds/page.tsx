'use client'

import { useState } from 'react'

import { ArrowBackIosNew } from '@mui/icons-material'
import Link from 'next/link'

import LinkButton from '@/components/ui/link-button'
import RadioGroup, { RadioButton } from '@/components/ui/radio'
import { DAY_OPTIONS } from '@/constants/game'

const SelectDaysPage = () => {
  const [selectedDay, setSelectedDay] = useState(DAY_OPTIONS[0])

  const handleChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDay(event.target.value)
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center">
      <Link href="/" className="absolute left-0 top-0 mx-4 mt-6">
        <ArrowBackIosNew />
      </Link>
      <h1 className="px-3 text-center text-xl">시장에서 거래할 일수를 정해주세요.</h1>
      <RadioGroup className="my-20">
        {DAY_OPTIONS.map((day) => (
          <RadioButton
            key={day}
            name="select-rounds"
            label={day}
            isChecked={day === selectedDay}
            onChangeInput={handleChangeInput}
          />
        ))}
      </RadioGroup>
      <LinkButton href={`/setup/user-info`}>다음</LinkButton>
    </main>
  )
}

export default SelectDaysPage
