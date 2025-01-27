'use client'

import { useState, useRef } from 'react'

import clsx from 'clsx'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

import GuideButton from '@/components/features/guide-button'
import { TrendingFlatIcon } from '@/components/icons'
import Input from '@/components/ui/input'
import LinkButton from '@/components/ui/link-button'
import { useSocket } from '@/hooks/use-socket'
import { isValidId } from '@/lib/utils/generate-game-id'
import logo from '@/public/images/logo.png'
import useGameStore from '@/store/game'

const HomePage = () => {
  const router = useRouter()
  const [inputGameId, setInputGameId] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const gameIdInputRef = useRef(null)

  const { socket } = useSocket()
  const setGameId = useGameStore((state) => state.setGameId)
  const setIsLeader = useGameStore((state) => state.setIsLeader)

  const handleGameIdChange = (event) => {
    setInputGameId(event.target.value)
    setErrorMessage('')
  }

  const handleGameIdSubmit = () => {
    if (!isValidId(inputGameId)) {
      setErrorMessage('유효한 게임 ID를 입력해 주세요.')
      if (gameIdInputRef.current) {
        gameIdInputRef.current?.focus()
      }
      return
    }

    socket.emit('check_game_availability', { inputGameId })
    socket.on('is_available_game', ({ isAvailable, message }) => {
      if (isAvailable) {
        setGameId(inputGameId)
        setIsLeader(false)
        router.push('/setup/user-info')
      } else {
        setErrorMessage(message)
        if (gameIdInputRef.current) {
          gameIdInputRef.current?.focus()
        }
      }
    })
  }

  return (
    <main className="flex min-h-dvh flex-col justify-center bg-sky-mobile bg-cover bg-fixed bg-center md:bg-sky-desktop">
      <h1 className="mb-20 flex justify-center">
        <Image src={logo} alt="냥트코인" width={280} height={140} />
      </h1>

      <div className="flex flex-col items-center gap-4">
        <LinkButton href="/setup/select-rounds">방 만들기</LinkButton>

        <div className="relative flex items-center">
          <Input
            value={inputGameId}
            onChange={handleGameIdChange}
            ref={gameIdInputRef}
            placeholder="N09C14"
            className={clsx('border-2 font-galmuri', { 'border-red': errorMessage })}
          />
          <button
            className="absolute right-3 top-[14px] cursor-pointer"
            onClick={handleGameIdSubmit}
          >
            <TrendingFlatIcon className="text-gray-300 hover:text-gray-500" size={24} />
          </button>

          {errorMessage && (
            <p className="absolute left-0 top-[50px] ml-3 mt-3 font-galmuri text-red">
              {errorMessage}
            </p>
          )}
        </div>

        <div className="mt-6">
          <GuideButton />
        </div>
      </div>
    </main>
  )
}

export default HomePage
