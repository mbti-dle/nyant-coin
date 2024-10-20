'use client'

import { useState } from 'react'

import { ArrowBackIosNew } from '@mui/icons-material'
import Link from 'next/link'

import AvatarSelector from '@/components/ui/avatar-selector'
import Button from '@/components/ui/button'
import CountInput from '@/components/ui/count-input'

const AVATAR_COUNT = 6

const UserInfoPage = ({ params }) => {
  const { gameId = 'N09C14' } = params

  const [currentAvatarIndex, setCurrentAvatarIndex] = useState(1)
  const [nickname, setNickname] = useState('')

  const handlePrevClick = () => {
    setCurrentAvatarIndex((prevIndex) => (prevIndex === 1 ? AVATAR_COUNT : prevIndex - 1))
  }

  const handleNextClick = () => {
    setCurrentAvatarIndex((prevIndex) => (prevIndex === AVATAR_COUNT ? 1 : prevIndex + 1))
  }

  const handleJoinClick = () => {
    const selectedAvatar = `/images/cat-${currentAvatarIndex}.png`
    console.log(`You will join as: ${selectedAvatar}`)
  }

  const handleNicknameChange = (event) => {
    setNickname(event.target.value)
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
      <div>
        <CountInput
          value={nickname}
          onChange={handleNicknameChange}
          placeholder="닉네임"
          className="font-galmuri"
        />
        {/* 오류메세지 */}
      </div>
      <Link href={`/waiting/${gameId}`} className="mt-20">
        <Button onClick={handleJoinClick}>입장하기</Button>
      </Link>
    </main>
  )
}

export default UserInfoPage
