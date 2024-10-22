'use client'

import { useEffect, useState } from 'react'

import TrendingFlatIcon from '@mui/icons-material/TrendingFlat'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

import GuideButton from '@/components/features/guide-button'
import Input from '@/components/ui/input'
import LinkButton from '@/components/ui/link-button'
import { socket } from '@/lib/socket'
import logo from '@/public/images/logo.png'

const HomePage = () => {
  const [gameId, setGameId] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const router = useRouter()

  useEffect(() => {
    const handleSocketConnect = () => {
      setIsConnected(true)
    }

    const handleSocketDisconnect = () => {
      setIsConnected(false)
    }

    socket.on('connect', handleSocketConnect)
    socket.on('disconnect', handleSocketDisconnect)

    setIsConnected(socket.connected)

    if (!socket.connected) {
      socket.connect()
    }

    return () => {
      socket.off('connect', handleSocketConnect)
      socket.off('disconnect', handleSocketDisconnect)
    }
  }, [])

  const handleGameIdChange = (event) => {
    setGameId(event.target.value)
  }

  const handleGameIdSubmit = () => {
    socket.emit('check_game_availability', gameId)
    socket.on('is_available_game', ({ isAvailable, message }) => {
      if (isAvailable) {
        router.push('/setup/user-info')
      } else {
        setErrorMessage(message)
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
          <Input value={gameId} onChange={handleGameIdChange} placeholder="N09C14" />
          <button
            className="absolute right-3 top-[15px] cursor-pointer text-gray-300"
            onClick={handleGameIdSubmit}
          >
            <TrendingFlatIcon />
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
