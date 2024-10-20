import { v4 as uuid } from 'uuid'

const GenerateGameId = (existingIds: Set<string>) => {
  let newId: string
  const generateUniqueId = (): string => {
    return uuid().substring(0, 6).toUpperCase()
  }

  const isValidId = (id: string): boolean => {
    return /^[A-Z0-9]{6}$/.test(id)
  }

  do {
    newId = generateUniqueId()
  } while (existingIds.has(newId) || !isValidId(newId))

  return newId
}
