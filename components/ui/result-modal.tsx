'use client'

import { useState } from 'react'

import Image from 'next/image'

import Modal from '@/components/ui/modal'

interface ResultModalProps {
  coin: number
  totalCoin: number
}

const ResultModal = ({ coin, totalCoin }: ResultModalProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleOpenModal = () => setIsOpen(true)
  const handleCloseModal = () => setIsOpen(false)

  return (
    <>
      <button onClick={handleOpenModal} className="text-blue-500 cursor-pointer">
        결과를 보고 싶다면?
      </button>
      <Modal isOpen={isOpen} onModalClose={handleCloseModal} hasButton={true}>
        <div className="mt-8 text-center">
          <div className="mb-3 flex justify-center">
            <Image src="/images/fish.png" alt="생선" width={24} height={24} />
          </div>
          <p className="mb-3 font-galmuri">최종 생선 판매 가격</p>
          <p className="mb-5 text-2xl">{coin} 냥코인</p>
          <p className="mb-6 font-galmuri text-sm text-gray-400">
            (보유 생선은 시세에 맞게 <br />
            모두 판매 되었습니다.)
          </p>
          <p className="mb-8 flex items-center justify-center font-galmuri">
            최종 냥코인
            <Image src="/images/coin.png" alt="코인" width={24} height={24} className="ml-2 mr-2" />
            {totalCoin}
          </p>
        </div>
      </Modal>
    </>
  )
}
export default ResultModal
