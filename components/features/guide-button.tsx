'use client'

import { useState } from 'react'

import Modal from '@/components/ui/modal'
import { GAME_GUIDE_STEPS } from '@/constants/game'

const GuideButton = () => {
  const [isOpen, setIsOpen] = useState(false)

  const handleModalOpen = () => setIsOpen(true)
  const handleModalClose = () => setIsOpen(false)

  return (
    <>
      <button onClick={handleModalOpen} className="text-blue-500 cursor-pointer">
        게임 방법을 보고 싶다면?
      </button>
      <Modal
        title="게임 방법"
        isOpen={isOpen}
        onModalClose={handleModalClose}
        isShowCloseButton={true}
        shouldCloseOnBackgroundClick={true}
      >
        <ul className="mx-1 mt-5 font-galmuri text-sm">
          {GAME_GUIDE_STEPS.map((step, index) => (
            <li key={index} className="mb-5 flex items-center">
              {index < 5 ? (
                <span className="text-md mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary leading-none text-white">
                  {index + 1}
                </span>
              ) : null}{' '}
              <span className="flex-1">{step}</span>
            </li>
          ))}
        </ul>
      </Modal>
    </>
  )
}
export default GuideButton
