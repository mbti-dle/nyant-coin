'use client'

import { useState, useEffect, useRef } from 'react'

import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ArrowBackIcon } from '@/components/icons'
import AvatarSelector from '@/components/ui/avatar-selector'
import Button from '@/components/ui/button'
import CountInput from '@/components/ui/count-input'
import { useGameState } from '@/hooks/game/use-game-state'
import { useSocket } from '@/hooks/socket/core/use-socket'
import { validateNickname } from '@/lib/utils/nickname-validation'
import useToastStore from '@/store/toast'

const AVATAR_COUNT = 6

const UserInfoPage = () => {
  const router = useRouter()
  const { socket, isSocketConnected } = useSocket()
  const { gameId, isLeader, rounds, playerId } = useGameState()
  const showToast = useToastStore((state) => state.showToast)

  const [currentAvatarIndex, setCurrentAvatarIndex] = useState(1)
  const [nickname, setNickname] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const countInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (playerId && gameId) {
      router.push(`/waiting/${gameId}`)
    }
  }, [playerId, gameId, router])

  useEffect(() => {
    if (!socket) return

    const handleJoinFailure = ({ message }: { message: string }) => {
      setErrorMessage(message)
    }

    socket.on('join_failure', handleJoinFailure)

    return () => {
      socket.off('join_failure', handleJoinFailure)
    }
  }, [socket])

  const isButtonDisabled = !nickname.trim() || !isSocketConnected

  const handlePrevClick = () => {
    setCurrentAvatarIndex((prevIndex) => (prevIndex === 1 ? AVATAR_COUNT : prevIndex - 1))
  }

  const handleNextClick = () => {
    setCurrentAvatarIndex((prevIndex) => (prevIndex === AVATAR_COUNT ? 1 : prevIndex + 1))
  }

  const joinGame = (newGameId: string | null) => {
    if (!socket) return
    socket.emit('join_game', {
      gameId: newGameId,
      nickname,
      character: currentAvatarIndex,
    })
  }

  const handleJoinClick = () => {
    if (!socket) {
      showToast('서버 연결 중입니다. 잠시만 기다려주세요.')
      return
    }

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

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center">
      <Link
        href={isLeader ? '/setup/select-rounds' : '/'}
        className="absolute left-0 top-0 mx-4 mt-6"
      >
        <ArrowBackIcon className="text-gray-300 hover:text-gray-500" size={24} />
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
        disabled={isButtonDisabled}
        className={clsx('mt-20', {
          '': !isButtonDisabled,
          'cursor-not-allowed bg-gray-100 text-gray-200 hover:bg-gray-100': isButtonDisabled,
        })}
      >
        {isSocketConnected ? '입장하기' : '연결 중...'}
      </Button>
    </main>
  )
}

export default UserInfoPage
