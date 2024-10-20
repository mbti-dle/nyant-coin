export const INITIAL_COINS = 1000
export const INITIAL_FISH_PRICE = 1000
export const TOTAL_ROUNDS = 3
export const INITIAL_TIMER = 20
export const FINAL_COIN = 100

export const AVATARS = [
  { imageUrl: '/images/cat-1.png', nickName: '대장고양이', isLeader: true, id: '1' },
  { imageUrl: '/images/cat-2.png', nickName: '제임스', id: '2' },
  { imageUrl: '/images/cat-3.png', nickName: '레드히어로', id: '3' },
  { imageUrl: '/images/cat-4.png', nickName: '마크정식주세요제발요', id: '4' },
  { imageUrl: '/images/cat-5.png', nickName: '다은메롱', id: '5' },
]

export const SIX_AVATARS = [...AVATARS, ...Array(Math.max(0, 6 - AVATARS.length)).fill({})]
