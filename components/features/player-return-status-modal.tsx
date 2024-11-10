import Button from '@/components/ui/button'
import Modal from '@/components/ui/modal'
import React from 'react'

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
    <React.Fragment>
      <Modal isOpen={isOpen} title="게임 시작 확인" onModalClose={onModalClose}>
        <div className="flex flex-col items-center gap-4">
          <p>현재 {notReturnedPlayerCount}명이 대기실에 없습니다.</p>
          <p>그래도 게임을 시작하시겠습니까?</p>
          <div className="flex w-full gap-2">
            <Button
              variant="white"
              className="w-1/2 cursor-pointer bg-white text-primary hover:bg-white"
              onClick={onModalClose}
            >
              취소하기
            </Button>
            <Button
              variant="primary"
              className="w-1/2 cursor-pointer bg-primary text-white"
              onClick={onModalConfirm}
            >
              시작하기
            </Button>
          </div>
        </div>
      </Modal>
    </React.Fragment>
  )
}

export default PlayerReturnStatusModal
