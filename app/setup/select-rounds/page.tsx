'use client'

import { useState, useEffect } from 'react'

import Link from 'next/link'
import { MdArrowBackIosNew } from 'react-icons/md'

import LinkButton from '@/components/ui/link-button'
import RadioGroup, { RadioButton } from '@/components/ui/radio'
import { DAY_OPTIONS } from '@/constants/game'
import useGameStore from '@/store/game'

const SelectDaysPage = () => {
  const [selectedDay, setSelectedDay] = useState(DAY_OPTIONS[0])

  const gameId = useGameStore((state) => state.gameId)
  const setGameRounds = useGameStore((state) => state.setGameRounds)
  const setIsLeader = useGameStore((state) => state.setIsLeader)

  useEffect(() => {
    if (!gameId) {
      setIsLeader(true)
    }
  }, [gameId, setIsLeader])

  const handleChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rounds = event.target.value
    setSelectedDay(rounds)
    setGameRounds(parseInt(rounds, 10))
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center">
      <Link href="/" className="absolute left-0 top-0 mx-4 mt-6">
        <MdArrowBackIosNew className="text-gray-300 hover:text-gray-500" size={24} />
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
