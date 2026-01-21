import { useMemo } from 'react'

import { PeerConnectionStateModel, PeerConnectionStateType } from '@/types/game'

import { useNetworkConnectivity } from '../infra/use-network-connectivity'
import { useNetworkUI } from '../ui/use-network-ui'

interface NetworkStatusModel {
  isSocketConnected: boolean
  reconnectionAttempts: number
}

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
