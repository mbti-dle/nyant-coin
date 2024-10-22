'use client'

import { useState } from 'react'

import { ArrowBackIosNew } from '@mui/icons-material'
import Link from 'next/link'
import { useRouter } from 'next/navigation' // useRouter 가져오기

import AvatarSelector from '@/components/ui/avatar-selector'
import Button from '@/components/ui/button'
import CountInput from '@/components/ui/count-input'
import { validateNickname } from '@/lib/utils/validation'

const UserInfoPage = () => {
  const AVATAR_COUNT = 6
  const router = useRouter()

  const [gameId, setGameId] = useState('N09C14')
  const [currentAvatarIndex, setCurrentAvatarIndex] = useState(1)
  const [nickname, setNickname] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

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
    console.log(`You will join as: ${selectedAvatar}`)

    router.push(`/waiting/${gameId}`)
  }

  const handleNicknameChange = (event) => {
    const { value } = event.target
    setNickname(value)
    setErrorMessage('')
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
