import React from 'react'

import Image from 'next/image'

import Button from '@/components/ui/button'
import Modal from '@/components/ui/modal'

interface PlayerReturnStatusModalProps {
  notReturnedPlayerCount: number
  isOpen: boolean
  onModalConfirm: () => void
  onModalClose: () => void
}

const PlayerReturnStatusModal = ({
  notReturnedPlayerCount,
  isOpen,
  onModalConfirm,
  onModalClose,
}: PlayerReturnStatusModalProps) => {
  return (
    <Modal isOpen={isOpen} isShowCloseButton={true} onModalClose={onModalClose}>
      <div className="mb-3 mt-8 flex flex-col items-center justify-center gap-6 p-2 font-galmuri">
        <Image src="/images/cat-404.png" alt="404고양이" width={50} height={50} />
        <p>현재 {notReturnedPlayerCount}명이 대기실에 없습니다.</p>
        <p>그래도 게임을 시작하시겠습니까?</p>
        <div className="mb-1 mt-4 flex w-full justify-center text-xl">
          <Button
            variant="primary"
            className="mb-2 cursor-pointer bg-primary font-neodgm text-white"
            onClick={onModalConfirm}
          >
            시작하기
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default PlayerReturnStatusModal
