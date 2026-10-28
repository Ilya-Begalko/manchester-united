export interface ProxyResult {
  status: number
  body: unknown
  /** Seconds the response may be cached by the CDN / browser. 0 disables caching. */
  ttl: number
}

interface Entry {
  result: ProxyResult
  expiresAt: number
}

const store = new Map<string, Entry>()
const inflight = new Map<string, Promise<ProxyResult>>()

/**
 * In-memory cache shared by all requests handled by one server instance.
 * Successful responses are kept for `ttl` seconds; on upstream failure a
 * stale copy (if any) is served instead of the error.
 */
export async function cached(key: string, ttl: number, load: () => Promise<ProxyResult>): Promise<ProxyResult> {
  const entry = store.get(key)
  if (entry && entry.expiresAt > Date.now()) return entry.result

  const pending = inflight.get(key)
  if (pending) return pending

  const promise = load()
    .catch((): ProxyResult => ({ status: 502, body: { message: 'Data provider is unreachable.' }, ttl: 0 }))
    .then((result) => {
      if (result.status === 200) {
        store.set(key, { result, expiresAt: Date.now() + Math.min(ttl, result.ttl || ttl) * 1000 })
        return result
      }
      return entry ? { ...entry.result, ttl: 30 } : result
    })
    .finally(() => inflight.delete(key))

  inflight.set(key, promise)
  return promise
}
