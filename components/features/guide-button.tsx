'use client'

import { useState } from 'react'

import Modal from '@/components/ui/modal'
import { GAME_GUIDE_STEPS, GAME_GUIDE_COMMENT } from '@/constants/game'

const GuideButton = () => {
  const [isOpen, setIsOpen] = useState(false)

  const handleModalOpen = () => setIsOpen(true)
  const handleModalClose = () => setIsOpen(false)

  return (
    <>
      <button
        onClick={handleModalOpen}
        className="group flex items-center font-galmuri text-sm text-blue"
      >
        <span className="mr-2 flex h-4 w-4 justify-center rounded-full bg-blue font-neodgm text-white">
          ?
        </span>
        게임방법
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
              <span className="text-md mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary leading-none text-white">
                {index + 1}
              </span>
              <span className="flex-1">{step}</span>
            </li>
          ))}
        </ul>
        <p className="mb-7 ml-12 mr-12 mt-5 text-center font-galmuri text-sm">
          {GAME_GUIDE_COMMENT}
        </p>
      </Modal>
    </>
  )
}
export default GuideButton
