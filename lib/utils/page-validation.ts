import { PAGE_VALIDATION_CONFIG } from '@/constants/page-validation'
import { PageValidationType, GameStoreStateModel } from '@/types/game'

/**
 * 스토어 데이터가 페이지 요구사항을 충족하는지 검사합니다.
 * @returns 누락된 필드 목록
 */
export const validatePageAccess = (
  pageType: PageValidationType,
  storeData: Partial<GameStoreStateModel>
): (keyof GameStoreStateModel)[] => {
  const config = PAGE_VALIDATION_CONFIG[pageType]

  return config.requiredFields.filter((field) => {
    const value = storeData[field]

    if (value === null || value === undefined || value === '') {
      return true
    }

    if (Array.isArray(value) && value.length === 0) {
      return true
    }

    return false
  })
}

/**
 * 경로명에서 페이지 유형을 추출합니다.
 */
export const getPageTypeFromPath = (pathname: string): PageValidationType | null => {
  if (pathname.startsWith('/setup/select-rounds')) return 'setup-rounds'
  if (pathname.startsWith('/setup/user-info')) return 'setup-info'
  if (pathname.startsWith('/waiting/')) return 'waiting'
  if (pathname.startsWith('/game/')) return 'game'
  if (pathname.startsWith('/result/')) return 'result'
  return null
}
