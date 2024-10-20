import { v4 as uuid } from 'uuid'

import GameModel from '@/types/game'

export const generateGameId = (gameRooms: Map<string, GameModel>) => {
  let newId: string
  const generateRandomId = (): string => {
    return uuid().substring(0, 6).toUpperCase()
  }

  const isValidId = (id: string): boolean => {
    return /^[A-Z0-9]{6}$/.test(id)
  }

  do {
    newId = generateRandomId()
  } while (gameRooms.has(newId) || !isValidId(newId))

  return newId
}
