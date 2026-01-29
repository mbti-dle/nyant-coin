import { useMemo } from 'react'

import { PeerConnectionStateModel, PeerConnectionStateType } from '@/types/game'

import { useNetworkConnectivity } from '../infra/use-network-connectivity'
import { useNetworkUI } from '../ui/use-network-ui'

interface NetworkStatusModel {
  isSocketConnected: boolean
  reconnectionAttempts: number
}

/**
 * [Facade Layer] 네트워크 연결 상태와 UI 피드백 로직을 결합하여 관리하는 오케스트레이터 훅입니다.
 */
export const useNetworkStatus = ({
  isSocketConnected,
  reconnectionAttempts,
}: NetworkStatusModel) => {
  const { hasNetworkConnection } = useNetworkConnectivity()

  const connectionStatus = useMemo<PeerConnectionStateType>(() => {
    if (!hasNetworkConnection || !isSocketConnected) {
      return reconnectionAttempts <= 2
        ? PeerConnectionStateModel.RECONNECTING
        : PeerConnectionStateModel.DEGRADED
    }
    return PeerConnectionStateModel.CONNECTED
  }, [hasNetworkConnection, isSocketConnected, reconnectionAttempts])

  const { isInOfflineMode } = useNetworkUI(connectionStatus, hasNetworkConnection)

  return {
    hasNetworkConnection,
    connectionStatus,
    isInOfflineMode,
  }
}
