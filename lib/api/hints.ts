import { HintModel } from '@/types/game'

import sql from '../database.js'

export const loadGameHints = async (totalRounds: number): Promise<HintModel[]> => {
  try {
    const hints = await sql`
        SELECT 
          id,
          hint,
          expectedchange,
          matchoutcomehigh,
          matchoutcomelow,
          mismatchoutcomehigh,
          mismatchoutcomelow
        FROM hints 
        ORDER BY RANDOM() 
        LIMIT ${totalRounds}
      `

    return hints.map((hint) => ({
      id: hint.id,
      hint: hint.hint,
      expectedChange: hint.expectedchange,
      matchOutcomeHigh: hint.matchoutcomehigh,
      matchOutcomeLow: hint.matchoutcomelow,
      mismatchOutcomeHigh: hint.mismatchoutcomehigh,
      mismatchOutcomeLow: hint.mismatchoutcomelow,
    }))
  } catch (error) {
    console.error('힌트 불러오기 오류')
    throw error
  }
}
