import type { ServerResponse } from 'node:http'
import type { ProxyResult } from './cache.js'

export function toQuery(raw: Record<string, string | string[] | undefined>): Record<string, string | undefined> {
  const query: Record<string, string | undefined> = {}
  for (const [key, value] of Object.entries(raw)) {
    query[key] = Array.isArray(value) ? value[0] : value
  }
  return query
}

export function sendResult(res: ServerResponse, result: ProxyResult) {
  res.statusCode = result.status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader(
    'Cache-Control',
    result.ttl > 0
      ? `public, max-age=${Math.min(60, result.ttl)}, s-maxage=${result.ttl}, stale-while-revalidate=${result.ttl * 4}`
      : 'no-store',
  )
  res.end(JSON.stringify(result.body))
}
