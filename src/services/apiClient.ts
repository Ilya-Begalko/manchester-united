import axios, { AxiosError } from 'axios'
import { MAN_UNITED_ID, PREMIER_LEAGUE_CODE } from '@/utils/football'

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

/** Production has no API server: `vite build` writes these files into `dist/data`. */
const STATIC_FILES: Record<string, string> = {
  [`teams/${MAN_UNITED_ID}/matches`]: 'matches.json',
  [`teams/${MAN_UNITED_ID}`]: 'team.json',
  [`competitions/${PREMIER_LEAGUE_CODE}/standings`]: 'standings.json',
  [`competitions/${PREMIER_LEAGUE_CODE}/scorers`]: 'scorers.json',
}

function dataUrl(file: string) {
  return `${import.meta.env.BASE_URL}data/${file}`
}

function staticGet<T>(file: string, { force = false } = {}): Promise<T> {
  const key = `static:${file}`
  if (!force && memoryCache.has(key)) return memoryCache.get(key) as Promise<T>

  const request = fetch(dataUrl(file))
    .then(async (response) => {
      if (!response.ok) throw new ApiError('Could not reach the data service.', response.status)
      return response.json() as Promise<T>
    })
    .catch((error: unknown) => {
      memoryCache.delete(key)
      if (error instanceof ApiError) throw error
      throw new ApiError('Could not reach the data service.', null)
    })

  memoryCache.set(key, request)
  return request
}

export function footballGet<T>(path: string, params: Record<string, string | number> = {}, options?: { force?: boolean }) {
  if (import.meta.env.PROD) {
    const file = STATIC_FILES[path]
    if (!file) return Promise.reject(new ApiError('Requested resource is not allowed.', 400))
    return staticGet<T>(file, options)
  }
  return apiGet<T>('/football', { path, ...params }, options)
}

export function newsGet<T>(options?: { force?: boolean }) {
  if (import.meta.env.PROD) return staticGet<T>('news.json', options)
  return apiGet<T>('/news', {}, options)
}
