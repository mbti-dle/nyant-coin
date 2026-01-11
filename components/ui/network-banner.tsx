import React, { useEffect, useState } from 'react'

import { FiRefreshCw } from 'react-icons/fi'

import { WifiOffIcon } from '@/components/icons'
import { PeerConnectionStateModel, PeerConnectionStateType } from '@/types/game'

import SnackBar from './snack-bar'

interface NetworkBannerProps {
  status: PeerConnectionStateType
  className?: string
}

const NetworkBanner = ({ status, className }: NetworkBannerProps) => {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    let timer: NodeJS.Timeout

    if (
      status === PeerConnectionStateModel.CONNECTED ||
      status === PeerConnectionStateModel.CONNECTING
    ) {
      setShowBanner(false)
    } else if (status === PeerConnectionStateModel.RECONNECTING) {
      timer = setTimeout(() => {
        setShowBanner(true)
      }, 60000)
    } else if (
      status === PeerConnectionStateModel.DEGRADED ||
      status === PeerConnectionStateModel.LOST
    ) {
      setShowBanner(true)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [status])

  const isLost =
    status === PeerConnectionStateModel.LOST || status === PeerConnectionStateModel.DEGRADED

  const icon = isLost ? (
    <WifiOffIcon className="text-red-500" size={24} />
  ) : (
    <FiRefreshCw className="animate-spin-slow h-5 w-5 text-yellow-400" />
  )

  return (
    <>
      <SnackBar
        isVisible={showBanner}
        message={isLost ? '인터넷 연결이 불안정합니다' : '연결 재시도 중...'}
        icon={icon}
        action={{
          label: '나가기',
          onClick: () => (window.location.href = '/'),
        }}
        className={className}
      />

      <style jsx global>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 2s linear infinite;
        }
      `}</style>
    </>
  )
}

export default NetworkBanner
