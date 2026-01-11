import { memo } from 'react'

import { PeerConnectionStateModel, PeerConnectionStateType } from '@/types/game'

interface ConnectionIndicatorProps {
  status: PeerConnectionStateType
  isReconnectedTransition?: boolean
}

const ConnectionIndicator = memo(
  ({ status, isReconnectedTransition }: ConnectionIndicatorProps) => {
    return (
      <div className="relative h-2.5 w-2.5">
        {(status === PeerConnectionStateModel.CONNECTING || isReconnectedTransition) && (
          <>
            <div className="absolute inset-0 animate-ping rounded-full bg-green-500 opacity-75"></div>
            <div className="relative h-2.5 w-2.5 rounded-full bg-green-500"></div>
          </>
        )}

        {status === PeerConnectionStateModel.CONNECTED && !isReconnectedTransition && (
          <div className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.6)]"></div>
        )}

        {status === PeerConnectionStateModel.RECONNECTING && (
          <>
            <div className="absolute inset-0 animate-ping rounded-full bg-yellow-500 opacity-75"></div>
            <div className="relative h-2.5 w-2.5 rounded-full bg-yellow-500"></div>
          </>
        )}

        {(status === PeerConnectionStateModel.DEGRADED ||
          status === PeerConnectionStateModel.LOST) && (
          <>
            <div className="bg-red-500 absolute inset-0 animate-ping rounded-full opacity-75"></div>
            <div className="bg-red-500 relative h-2.5 w-2.5 rounded-full"></div>
          </>
        )}
      </div>
    )
  }
)

ConnectionIndicator.displayName = 'ConnectionIndicator'

export default ConnectionIndicator
