import { NextResponse } from 'next/server'

import sql from '@/lib/database'
import { HintModel } from '@/types/hint'

export async function GET() {
  try {
    const hints: HintModel[] = await sql`
      SELECT id, brief_content, full_content_match, full_content_mismatch, category
      FROM hints
      WHERE category IN ('상승', '하강')
      ORDER BY RANDOM()
      LIMIT 10
    `
    return NextResponse.json(hints)
  } catch (error) {
    console.error('Database query error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
