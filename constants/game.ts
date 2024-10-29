export const GAME_GUIDE_STEPS = [
  '각 플레이어는 게임 시작 시 1,000냥코인을 지급받습니다.',
  '생선 가격은 첫날 100냥코인으로 시작해, 매일 1~300냥코인 사이에서 변동됩니다.',
  "20초 안에 생선을 사고 팔아야 하며, '사기' 또는 '팔기' 버튼을 눌러 거래할 수 있습니다.",
  '시장에서 대한 힌트가 주어지지만, 100% 정확하지는 않으니 주의하세요!',
  '최종적으로 가장 많은 냥코인을 모은 플레이어가 우승합니다.',
]

export const GAME_GUIDE_COMMENT = '최적의 타이밍에 거래해서 우승을 차지하세요!'

export const DAY_OPTIONS = ['10일', '15일', '20일']

export const gameConfig = {
  INITIAL_COINS: 1000,
  INITIAL_FISH: 0,
  INITIAL_FISH_PRICE: 100,
  INITIAL_TIMER: 20,
}

export const PRICE_THRESHOLD = {
  MIN: 1,
  MAX: 300,
} as const
