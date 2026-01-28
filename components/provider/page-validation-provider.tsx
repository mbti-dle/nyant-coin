'use client'

import { createContext, useEffect, useState } from 'react'

import { useRouter, usePathname } from 'next/navigation'

import LoadingScreen from '@/components/ui/loading-screen'
import { PAGE_VALIDATION_CONFIG } from '@/constants/page-validation'
import { getPageTypeFromPath, validatePageAccess } from '@/lib/utils/page-validation'
import useGameStore from '@/store/game'

interface PageValidationContextModel {
  isReady: boolean
}

export const PageValidationContext = createContext<PageValidationContextModel | null>(null)

interface PageValidationProviderProps {
  children: React.ReactNode
}

export const PageValidationProvider = ({ children }: PageValidationProviderProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const [isReady, setIsReady] = useState(false)
  const isHydrated = useGameStore((state) => state.isHydrated)

  const gameId = useGameStore((state) => state.gameId)
  const playerId = useGameStore((state) => state.playerId)
  const rounds = useGameStore((state) => state.rounds)
  const results = useGameStore((state) => state.results)

  useEffect(() => {
    if (!isHydrated) return

    if (pathname === '/') {
      if (!isReady) setIsReady(true)
      return
    }

    const pageType = getPageTypeFromPath(pathname)

    if (!pageType) {
      if (!isReady) setIsReady(true)
      return
    }

    const storeData = { gameId, playerId, rounds, results }
    const missingFields = validatePageAccess(pageType, storeData)

    if (missingFields.length > 0) {
      const config = PAGE_VALIDATION_CONFIG[pageType]
      console.warn(`[${pageType}] Missing required fields:`, missingFields)
      router.replace(config.redirectPath)
    } else {
      if (!isReady) setIsReady(true)
    }
  }, [pathname, router, isHydrated, gameId, playerId, rounds, results, isReady])

  if (!isHydrated || !isReady) {
    return <LoadingScreen />
  }

  return (
    <PageValidationContext.Provider value={{ isReady }}>{children}</PageValidationContext.Provider>
  )
}
