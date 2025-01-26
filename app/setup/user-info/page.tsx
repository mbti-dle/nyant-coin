'use client'

import { useState, useEffect, useRef } from 'react'

import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MdArrowBackIosNew } from 'react-icons/md'

import AvatarSelector from '@/components/ui/avatar-selector'
import Button from '@/components/ui/button'
import CountInput from '@/components/ui/count-input'
import { useSocket } from '@/hooks/use-socket'
import { validateNickname } from '@/lib/utils/nickname-validation'
import useGameStore from '@/store/game'
import useToastStore from '@/store/toast'

const UserInfoPage = () => {
  const AVATAR_COUNT = 6

  const router = useRouter()

  const [currentAvatarIndex, setCurrentAvatarIndex] = useState(1)
  const [nickname, setNickname] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const { socket } = useSocket()

  const showToast = useToastStore((state) => state.showToast)

  const countInputRef = useRef(null)

  const gameId = useGameStore((state) => state.gameId)
  const isLeader = useGameStore((state) => state.isLeader)
  const rounds = useGameStore((state) => state.rounds)

  useEffect(() => {
    const handleJoinSuccess = (gameId: string) => {
      router.push(`/waiting/${gameId}`)
    }

    const handleJoinFailure = () => {
      router.replace('/')
      showToast('이미 게임이 시작되었습니다')
    }

    socket.on('join_success', handleJoinSuccess)
    socket.on('join_failure', handleJoinFailure)

    return () => {
      socket.off('join_success', handleJoinSuccess)
      socket.off('join_failure', handleJoinFailure)
    }
  }, [router, showToast])

  const handlePrevClick = () => {
    setCurrentAvatarIndex((prevIndex) => (prevIndex === 1 ? AVATAR_COUNT : prevIndex - 1))
  }

  const handleNextClick = () => {
    setCurrentAvatarIndex((prevIndex) => (prevIndex === AVATAR_COUNT ? 1 : prevIndex + 1))
  }

  const handleJoinClick = () => {
    const error = validateNickname(nickname)
    if (error) {
      setErrorMessage(error)
      if (countInputRef.current) {
        countInputRef.current.focus()
      }
      return
    }

    if (isLeader) {
      socket.emit('create_game', rounds, joinGame)
    } else {
      joinGame(gameId)
    }
  }

  const handleNicknameChange = (event) => {
    const { value } = event.target
    setNickname(value)
    setErrorMessage('')
  }

  const joinGame = (gameId) => {
    socket.emit('join_game', {
      gameId,
      nickname,
      character: currentAvatarIndex,
    })
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center">
      <Link
        href={isLeader ? '/setup/select-rounds' : '/'}
        className="absolute left-0 top-0 mx-4 mt-6"
      >
        <MdArrowBackIosNew className="text-gray-300 hover:text-gray-500" size={24} />
      </Link>
      <AvatarSelector
        currentAvatarIndex={currentAvatarIndex}
        onPrevClick={handlePrevClick}
        onNextClick={handleNextClick}
      />
      <div className="relative h-[84px]">
        <CountInput
          ref={countInputRef}
          value={nickname}
          onChange={handleNicknameChange}
          placeholder="닉네임"
          className={clsx('border-2 font-galmuri', errorMessage && 'border-red')}
        />
        {errorMessage && (
          <p className="absolute bottom-0 left-0 ml-2 mt-3 font-galmuri text-red">{errorMessage}</p>
        )}
      </div>
      <Button
        onClick={handleJoinClick}
        disabled={!nickname.trim()}
        className={clsx('mt-20', {
          '': nickname.trim(),
          'cursor-not-allowed bg-gray-100 text-gray-200 hover:bg-gray-100': !nickname.trim(),
        })}
      >
        입장하기
      </Button>
    </main>
  )
}

export default UserInfoPage
