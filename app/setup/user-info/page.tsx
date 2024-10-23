'use client'

import { useState, useEffect } from 'react'

import { ArrowBackIosNew } from '@mui/icons-material'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import AvatarSelector from '@/components/ui/avatar-selector'
import Button from '@/components/ui/button'
import CountInput from '@/components/ui/count-input'
import { socket } from '@/lib/socket'
import { validateNickname } from '@/lib/utils/nickname-validation'
import useGameStore from '@/store/game'

const UserInfoPage = () => {
  const AVATAR_COUNT = 6
  const router = useRouter()

  const [currentAvatarIndex, setCurrentAvatarIndex] = useState(1)
  const [nickname, setNickname] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const gameId = useGameStore((state) => state.gameId)
  const isLeader = useGameStore((state) => state.isLeader)
  const rounds = useGameStore((state) => state.rounds)

  useEffect(() => {
    const handleJoinSuccess = (gameId: string) => {
      router.push(`/waiting/${gameId}`)
    }

    socket.on('join_success', handleJoinSuccess)

    return () => {
      socket.off('join_success', handleJoinSuccess)
    }
  }, [])

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
      return
    }

    const selectedAvatar = `/images/cat-${currentAvatarIndex}.png`

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
      <Link href="/setup/select-rounds" className="absolute left-0 top-0 mx-4 mt-6">
        <ArrowBackIosNew />
      </Link>
      <AvatarSelector
        currentAvatarIndex={currentAvatarIndex}
        onPrevClick={handlePrevClick}
        onNextClick={handleNextClick}
      />
      <div className="relative h-[84px]">
        <CountInput
          value={nickname}
          onChange={handleNicknameChange}
          placeholder="닉네임"
          className="font-galmuri"
        />
        {errorMessage && <p className="absolute bottom-0 left-0 mt-2 text-red">{errorMessage}</p>}
      </div>
      <Button onClick={handleJoinClick} disabled={!nickname.trim()} className="mt-20">
        입장하기
      </Button>
    </main>
  )
}

export default UserInfoPage
