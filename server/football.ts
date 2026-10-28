import { cached, type ProxyResult } from './cache.js'

const UPSTREAM = 'https://api.football-data.org/v4'

/**
 * Only these upstream resources may be requested through the proxy.
 * TTLs (seconds) are tuned so that a full page load costs at most 4 upstream
 * calls and repeated visits are served from cache, keeping us well under the
 * free tier limit of 10 requests per minute.
 */
const ROUTES: Array<{ pattern: RegExp; ttl: number; params: string[] }> = [
  { pattern: /^teams\/\d+\/matches$/, ttl: 120, params: ['season', 'status', 'dateFrom', 'dateTo', 'competitions', 'limit'] },
  { pattern: /^teams\/\d+$/, ttl: 6 * 60 * 60, params: [] },
  { pattern: /^competitions\/[A-Z0-9]+\/standings$/, ttl: 300, params: ['season', 'matchday'] },
  { pattern: /^competitions\/[A-Z0-9]+\/scorers$/, ttl: 600, params: ['season', 'limit'] },
]

const WINDOW_MS = 60_000
const MAX_CALLS_PER_WINDOW = 9
const upstreamCalls: number[] = []

function reserveUpstreamCall(): boolean {
  const now = Date.now()
  while (upstreamCalls.length && now - upstreamCalls[0] > WINDOW_MS) upstreamCalls.shift()
  if (upstreamCalls.length >= MAX_CALLS_PER_WINDOW) return false
  upstreamCalls.push(now)
  return true
}

export async function handleFootballRequest(
  path: string | undefined,
  query: Record<string, string | undefined>,
  apiKey: string | undefined,
): Promise<ProxyResult> {
  if (!apiKey) {
    return { status: 500, body: { message: 'FOOTBALL_DATA_API_KEY is not configured on the server.' }, ttl: 0 }
  }

  const cleanPath = (path ?? '').replace(/^\/+|\/+$/g, '')
  const route = ROUTES.find((r) => r.pattern.test(cleanPath))
  if (!route) {
    return { status: 400, body: { message: 'Requested resource is not allowed.' }, ttl: 0 }
  }

  const search = new URLSearchParams()
  for (const key of route.params) {
    const value = query[key]
    if (value) search.set(key, value)
  }
  const url = `${UPSTREAM}/${cleanPath}${search.size ? `?${search}` : ''}`

  return cached(url, route.ttl, async () => {
    if (!reserveUpstreamCall()) {
      return { status: 429, body: { message: 'Data provider rate limit reached. Please retry in a minute.' }, ttl: 0 }
    }

    const response = await fetch(url, { headers: { 'X-Auth-Token': apiKey }, signal: AbortSignal.timeout(10_000) })
    const body = await response.json().catch(() => ({ message: 'Invalid response from data provider.' }))

    if (!response.ok) {
      return {
        status: response.status,
        body: { message: (body as { message?: string }).message ?? `Data provider responded with ${response.status}.` },
        ttl: 0,
      }
    }
    return { status: 200, body, ttl: route.ttl }
  })
}
