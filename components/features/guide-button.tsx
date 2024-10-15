'use client'

import { useState } from 'react'

import Modal from '@/components/ui/modal'

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
        <div className="flex">
          <ul className="mx-1 mt-5 w-6 font-galmuri text-sm">
            <li className="mb-12 mt-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary font-galmuri text-base leading-none text-white">
              1
            </li>
            <li className="mb-14 flex h-5 w-5 items-center justify-center rounded-full bg-primary font-galmuri text-base leading-none text-white">
              2
            </li>
            <li className="mb-16 flex h-5 w-5 items-center justify-center rounded-full bg-primary font-galmuri text-base leading-none text-white">
              3
            </li>
            <li className="mb-14 flex h-5 w-5 items-center justify-center rounded-full bg-primary font-galmuri text-base leading-none text-white">
              4
            </li>
            <li className="flex h-5 w-5 items-center justify-center rounded-full bg-primary font-galmuri text-base leading-none text-white">
              5
            </li>
          </ul>
          <ul className="mx-1 mb-5 mt-5 flex-1 font-galmuri text-sm">
            <li className="mb-5 flex items-center">
              각 플레이어는 게임 시작 시 1,000냥코인을 지급받습니다.
            </li>
            <li className="mb-5">
              생선 가격은 첫날 100냥코인으로 시작해, 매일 1~300냥코인 사이에서 변동됩니다.
            </li>
            <li className="mb-5">
              20초 안에 생선을 사고 팔아야 하며, &apos;사기&apos; 또는 &apos;팔기&apos; 버튼을 눌러
              거래할 수 있습니다.
            </li>
            <li className="mb-5">
              시장에 대한 힌트가 주어지지만, 100% 정확하지는 않으니 주의하세요!
            </li>
            <li className="mb-5">최종적으로 가장 많은 냥코인을 모은 플레이어가 우승합니다.</li>
            <li className="mb-5">최적의 타이밍에 거래해서 우승을 차지하세요!</li>
          </ul>
        </div>
      </Modal>
    </>
  )
}

export default GuideButton
