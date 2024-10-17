'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

import Image from 'next/image'

import Hints from '@/components/features/hints'
import ResultModal from '@/components/features/result-modal'
import GameFooter from '@/components/layout/game-footer'
import GameHeader from '@/components/layout/game-header'
import CatBox from '@/components/ui/cat-box'
import Toast from '@/components/ui/toast'
import useToastStore from '@/store/toast'

const INITIAL_COINS = 100000
const INITIAL_FISH = 100000
const TOTAL_ROUNDS = 5
const INITIAL_TIMER = 20
const FINAL_COIN = 100

const GamePage = ({ params }) => {
  const [coins, setCoins] = useState(INITIAL_COINS)
  const [fish, setFish] = useState(INITIAL_FISH)
  const [inputValue, setInputValue] = useState('')
  const [fishPrice, setFishPrice] = useState(240)
  const [transactionResult, setTransactionResult] = useState({ message: '', key: 0 })
  const { showToast } = useToastStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentRound, setCurrentRound] = useState(1)
  const [timer, setTimer] = useState(INITIAL_TIMER)

  const intervalRef = useRef(null)
  const timerRef = useRef(INITIAL_TIMER)

  const totalCoin = fish * FINAL_COIN + coins

  const avatars = [
    { imageUrl: '/images/cat-1.png', nickName: '대장고양이', isLeader: true },
    { imageUrl: '/images/cat-2.png', nickName: '제임스' },
    { imageUrl: '/images/cat-3.png', nickName: '레드히어로' },
    { imageUrl: '/images/cat-4.png', nickName: '마크정식주세요제발요' },
    { imageUrl: '/images/cat-5.png', nickName: '다은메롱' },
  ]

  const sixAvatars = [...avatars, ...Array(Math.max(0, 6 - avatars.length)).fill({})]

  const incrementRound = useCallback(() => {
    setCurrentRound((prevRound) => {
      const newRound = prevRound === TOTAL_ROUNDS ? prevRound : prevRound + 1
      if (newRound === TOTAL_ROUNDS) setIsModalOpen(true)
      return newRound
    })
    timerRef.current = INITIAL_TIMER
    setTimer(INITIAL_TIMER)
  }, [])

  useEffect(() => {
    const updateTimer = () => {
      timerRef.current -= 1
      if (timerRef.current === 0) {
        incrementRound()
      } else {
        setTimer(timerRef.current)
      }
    }

    intervalRef.current = setInterval(updateTimer, 1000)
    return () => clearInterval(intervalRef.current)
  }, [incrementRound])

  const handleInputChange = ({ target: { value } }) => {
    if (value === '' || /^\d+$/.test(value)) setInputValue(value)
  }

  const handleTransaction = (isBuying) => {
    if (inputValue === '') return

    const amount = parseInt(inputValue)
    const totalValue = amount * fishPrice

    setTransactionResult({
      message: `${amount}마리 ${isBuying ? '사요!' : '팔아요!'}`,
      key: Date.now(),
    })

    if (isBuying && totalValue > coins) {
      showToast('보유 코인이 부족합니다', 'check')
    } else if (!isBuying && amount > fish) {
      showToast('보유 생선이 부족합니다', 'check')
    } else {
      setCoins((prevCoins) => (isBuying ? prevCoins - totalValue : prevCoins + totalValue))
      setFish((prevFish) => (isBuying ? prevFish + amount : prevFish - amount))
      setInputValue('')
    }
  }

  return (
    <>
      <Image
        src="/images/background-mobile-3.png"
        alt="모바일 해변 배경"
        layout="fill"
        objectFit="cover"
        priority
        className="block md:hidden"
      />
      <Image
        src="/images/background-desktop-3.png"
        alt="데스크탑 해변 배경"
        layout="fill"
        objectFit="cover"
        priority
        className="hidden md:block"
      />
      <main className="relative mx-auto flex h-screen min-h-screen w-full max-w-[375px] flex-col overflow-y-auto px-4 pt-[30px] md:pt-[50px]">
        <GameHeader coins={coins} fish={fish} timer={timer} />
        <Hints fishPrice={fishPrice} currentRound={currentRound} totalRounds={TOTAL_ROUNDS} />
        <div className="grid grid-cols-3 grid-rows-2 gap-2">
          {sixAvatars.map((avatar, index) => (
            <CatBox
              key={index}
              {...avatar}
              transactionResult={avatar.nickName === '대장고양이' ? transactionResult : undefined}
            />
          ))}
        </div>
        <GameFooter
          inputValue={inputValue}
          handleInputChange={handleInputChange}
          handleBuy={() => handleTransaction(true)}
          handleSell={() => handleTransaction(false)}
          isInputEmpty={inputValue === ''}
        />
        <Toast />
        <ResultModal
          isOpen={isModalOpen}
          onModalClose={() => setIsModalOpen(false)}
          coin={FINAL_COIN}
          totalCoin={totalCoin}
        />
      </main>
    </>
  )
}

export default GamePage
