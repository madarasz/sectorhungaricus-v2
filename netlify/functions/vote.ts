import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions'
import { getStore } from '@netlify/blobs'

interface VoteCounts {
  [artistId: string]: number
}

interface VoteRecord {
  [artistId: string]: number // timestamp of last vote
}

const COOLDOWN_MS = 24 * 60 * 60 * 1000 // 24 hours

function getClientIP(event: HandlerEvent): string {
  return (
    event.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    event.headers['client-ip'] ||
    event.headers['x-real-ip'] ||
    'unknown'
  )
}

function getCookieVotedArtists(event: HandlerEvent): string[] {
  const cookies = event.headers.cookie || ''
  const match = cookies.match(/voted_artists=([^;]+)/)
  if (match) {
    try {
      return JSON.parse(decodeURIComponent(match[1]))
    } catch {
      return []
    }
  }
  return []
}

function createVotedCookie(votedArtists: string[]): string {
  const value = encodeURIComponent(JSON.stringify(votedArtists))
  const maxAge = 24 * 60 * 60 // 24 hours in seconds
  return `voted_artists=${value}; Max-Age=${maxAge}; Path=/; SameSite=Lax`
}

const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  }

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' }
  }

  try {
    const store = getStore('artist-votes')

    // GET: Return all vote counts
    if (event.httpMethod === 'GET') {
      const voteCounts = await store.get('vote-counts', { type: 'json' }) as VoteCounts | null
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          votes: voteCounts || {},
        }),
      }
    }

    // POST: Submit a vote
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}')
      const { artistId } = body

      if (!artistId || typeof artistId !== 'string') {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Invalid artist ID',
          }),
        }
      }

      // Rate limiting check
      const clientIP = getClientIP(event)
      const ipRecordKey = `ip:${clientIP}`
      const ipVoteRecord = await store.get(ipRecordKey, { type: 'json' }) as VoteRecord | null
      const now = Date.now()

      // Check if this IP already voted for this artist within cooldown
      if (ipVoteRecord && ipVoteRecord[artistId]) {
        const lastVote = ipVoteRecord[artistId]
        if (now - lastVote < COOLDOWN_MS) {
          const hoursRemaining = Math.ceil((COOLDOWN_MS - (now - lastVote)) / (60 * 60 * 1000))
          return {
            statusCode: 429,
            headers,
            body: JSON.stringify({
              success: false,
              error: `Already voted. Please wait ${hoursRemaining} hour(s).`,
              alreadyVoted: true,
            }),
          }
        }
      }

      // Also check cookie as backup
      const cookieVoted = getCookieVotedArtists(event)
      if (cookieVoted.includes(artistId)) {
        return {
          statusCode: 429,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Already voted for this artist.',
            alreadyVoted: true,
          }),
        }
      }

      // Record the vote
      const voteCounts = (await store.get('vote-counts', { type: 'json' }) as VoteCounts) || {}
      voteCounts[artistId] = (voteCounts[artistId] || 0) + 1
      await store.setJSON('vote-counts', voteCounts)

      // Update IP vote record
      const updatedIpRecord: VoteRecord = ipVoteRecord || {}
      updatedIpRecord[artistId] = now
      await store.setJSON(ipRecordKey, updatedIpRecord)

      // Update cookie
      const updatedCookieVoted = [...cookieVoted, artistId]
      const setCookieHeader = createVotedCookie(updatedCookieVoted)

      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Set-Cookie': setCookieHeader,
        },
        body: JSON.stringify({
          success: true,
          votes: voteCounts,
          newCount: voteCounts[artistId],
        }),
      }
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method not allowed' }),
    }
  } catch (error) {
    console.error('Vote function error:', error)
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: false,
        error: 'Internal server error',
      }),
    }
  }
}

export { handler }
