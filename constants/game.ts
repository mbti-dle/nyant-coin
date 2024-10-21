export const GAME_GUIDE_STEPS = [
  '각 플레이어는 게임 시작 시 1,000냥코인을 지급받습니다.',
  '생선 가격은 첫날 100냥코인으로 시작해, 매일 1~300냥코인 사이에서 변동됩니다.',
  "20초 안에 생선을 사고 팔아야 하며, '사기' 또는 '팔기' 버튼을 눌러 거래할 수 있습니다.",
  '시장에서 대한 힌트가 주어지지만, 100% 정확하지는 않으니 주의하세요!',
  '최종적으로 가장 많은 냥코인을 모은 플레이어가 우승합니다.',
]

export const GAME_GUIDE_COMMENT = '최적의 타이밍에 거래해서 우승을 차지하세요!'

export const DAY_OPTIONS = ['10일', '15일', '20일']

export const INITIAL_COINS = 1000
export const INITIAL_FISH_PRICE = 100
export const INITIAL_TIMER = 20

// 더미 데이터
export const TOTAL_ROUNDS = 3
export const FINAL_COIN = 100

export const AVATARS = [
  { imageUrl: '/images/cat-1.png', nickName: '대장고양이', isLeader: true, id: '1' },
  { imageUrl: '/images/cat-2.png', nickName: '제임스', id: '2' },
  { imageUrl: '/images/cat-3.png', nickName: '레드히어로', id: '3' },
  { imageUrl: '/images/cat-4.png', nickName: '마크정식주세요제발요', id: '4' },
  { imageUrl: '/images/cat-5.png', nickName: '다은메롱', id: '5' },
]

export const SIX_AVATARS = [...AVATARS, ...Array(Math.max(0, 6 - AVATARS.length)).fill({})]
