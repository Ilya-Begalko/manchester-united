import axios, { AxiosError } from 'axios'

export class ApiError extends Error {
  readonly status: number | null

  constructor(message: string, status: number | null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const http = axios.create({
  baseURL: '/api',
  timeout: 15_000,
  headers: { Accept: 'application/json' },
})

function toApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const status = error.response?.status ?? null
    const serverMessage = (error.response?.data as { message?: string } | undefined)?.message
    if (status === 429) return new ApiError('Request limit reached. Please try again in a minute.', status)
    if (status === 403) return new ApiError('This data is not included in the current API plan.', status)
    if (serverMessage) return new ApiError(serverMessage, status)
    if (error.code === 'ECONNABORTED') return new ApiError('The request timed out.', status)
    return new ApiError('Could not reach the data service.', status)
  }
  return new ApiError('Unexpected error while loading data.', null)
}

/**
 * Session-lifetime cache: identical requests share one promise, so several
 * sections depending on the same resource trigger a single network call.
 */
const memoryCache = new Map<string, Promise<unknown>>()

export function apiGet<T>(url: string, params: Record<string, string | number> = {}, { force = false } = {}): Promise<T> {
  const key = `${url}?${new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]))}`
  if (!force && memoryCache.has(key)) return memoryCache.get(key) as Promise<T>

  const request = http
    .get<T>(url, { params })
    .then((response) => response.data)
    .catch((error: unknown) => {
      memoryCache.delete(key)
      throw toApiError(error)
    })

  memoryCache.set(key, request)
  return request
}

export function footballGet<T>(path: string, params: Record<string, string | number> = {}, options?: { force?: boolean }) {
  return apiGet<T>('/football', { path, ...params }, options)
}
