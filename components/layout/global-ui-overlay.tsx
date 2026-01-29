'use client'

import ErrorModal from '@/components/ui/error-modal'
import SnackBar from '@/components/ui/snack-bar'
import Toast from '@/components/ui/toast'

/**
 * [Layout Component] 전역 UI 요소(배너, 모달, 토스트)를 한곳에서 관리하여 렌더링합니다.
 * 각 컴포넌트가 자신의 상태를 직접 구독하므로 코드가 매우 간결합니다.
 */
const GlobalUIOverlay = () => {
  return (
    <>
      {/* 범용 스낵바 (네트워크 상태 등) */}
      <SnackBar />

      {/* 소켓 에러/경고 모달 */}
      <ErrorModal />

      {/* 토스트 알림 */}
      <Toast />
    </>
  )
}

export default GlobalUIOverlay
