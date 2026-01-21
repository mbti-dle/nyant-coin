/**
 * [Facade Layer] 네트워크 연결(Infra)과 UI 상태(UI)를 결합하여 통합된 연결 상태를 제공하는 퍼사드 훅입니다.
 * 소켓의 물리적 연결 여부와 네트워크 상태를 종합하여 최종적인 'PeerConnectionState'를 산출합니다.
 */
import { useEffect, useMemo } from 'react'

import { PeerConnectionStateModel, PeerConnectionStateType } from '@/types/game'

import { useNetworkConnectivity } from '../infra/use-network-connectivity'
import { useNetworkUI } from '../ui/use-network-ui'

interface NetworkStatusModel {
  isSocketConnected: boolean
  reconnectionAttempts: number
  onOnline?: () => void
}

export const useNetworkStatus = ({
  isSocketConnected,
  reconnectionAttempts,
  onOnline,
}: NetworkStatusModel) => {
  const { hasNetworkConnection, checkConnectivity } = useNetworkConnectivity()

  const {
    isInOfflineMode,
    shouldShowErrorModal,
    enterOfflineState,
    enterOnlineState,
    startReconnectToasts,
    stopReconnectToasts,
  } = useNetworkUI()

  useEffect(() => {
    if (hasNetworkConnection) {
      enterOnlineState()
      onOnline?.()
    } else {
      enterOfflineState()
    }
  }, [hasNetworkConnection, enterOnlineState, enterOfflineState, onOnline])

  const connectionStatus = useMemo<PeerConnectionStateType>(() => {
    if (!hasNetworkConnection || !isSocketConnected) {
      return reconnectionAttempts <= 2
        ? PeerConnectionStateModel.RECONNECTING
        : PeerConnectionStateModel.DEGRADED
    }
    return PeerConnectionStateModel.CONNECTED
  }, [hasNetworkConnection, isSocketConnected, reconnectionAttempts])

  return {
    hasNetworkConnection,
    isInOfflineMode,
    connectionStatus,
    shouldShowErrorModal,
    enterOfflineState,
    enterOnlineState,
    startReconnectToasts,
    stopReconnectToasts,
    checkConnectivity,
  }
}
