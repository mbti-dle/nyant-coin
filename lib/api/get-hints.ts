import { HintModel } from '@/types/hint'

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }

  if (process.env.RENDER && process.env.IS_PULL_REQUEST) {
    return `https://${process.env.RENDER_EXTERNAL_HOSTNAME}`
  }

  if (process.env.KOYEB_APP_NAME) {
    return `https://nyantcoin.koyeb.app`
  }

  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  return 'http://localhost:3000'
}

async function getHints(): Promise<HintModel[]> {
  const baseUrl = getBaseUrl()
  const url = `${baseUrl}/api/hints`

  try {
    const res = await fetch(url, { cache: 'no-store' })

    if (!res.ok) {
      throw new Error(`Failed to fetch hints: ${res.status} ${res.statusText}`)
    }

    return res.json()
  } catch (error) {
    console.error('Error fetching hints:', error)
    throw error
  }
}

export default getHints
