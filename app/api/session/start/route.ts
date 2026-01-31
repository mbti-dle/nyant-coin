import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const POST = async (req: Request) => {
  const { gameId } = await req.json()

  if (!gameId) {
    return NextResponse.json({ message: 'gameId is required' }, { status: 400 })
  }

  const cookieStore = await cookies()
  cookieStore.set('nyant_session', gameId, {
    path: '/',
    maxAge: 60 * 60 * 24,
    sameSite: 'lax',
  })

  return NextResponse.json({ ok: true })
}
