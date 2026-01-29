import { PageValidationType, PageValidationModel } from '@/types/game'

/**
 * 페이지별 진입에 필요한 필수 데이터 구성
 */
export const PAGE_VALIDATION_CONFIG: Record<PageValidationType, PageValidationModel> = {
  'setup-rounds': {
    requiredFields: [],
    redirectPath: '/',
  },
  'setup-info': {
    requiredFields: [],
    redirectPath: '/',
  },
  waiting: {
    requiredFields: ['gameId', 'playerId'],
    redirectPath: '/',
  },
  game: {
    requiredFields: ['gameId', 'playerId', 'rounds'],
    redirectPath: '/',
  },
  result: {
    requiredFields: ['gameId', 'playerId', 'results'],
    redirectPath: '/',
  },
}
