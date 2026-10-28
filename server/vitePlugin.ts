import type { Plugin } from 'vite'
import { handleFootballRequest } from './football.js'
import { handleNewsRequest } from './news.js'
import { handlePhotosRequest } from './photos.js'
import { sendResult, toQuery } from './http.js'

/** Serves /api/* during `vite dev` / `vite preview` with the same handlers used by the Vercel functions. */
export function apiProxy(apiKey: string | undefined): Plugin {
  const middleware = async (url: string | undefined, res: Parameters<typeof sendResult>[0], next: () => void) => {
    const parsed = new URL(url ?? '/', 'http://localhost')
    if (parsed.pathname === '/api/football') {
      const query = toQuery(Object.fromEntries(parsed.searchParams))
      sendResult(res, await handleFootballRequest(query.path, query, apiKey))
    } else if (parsed.pathname === '/api/news') {
      sendResult(res, await handleNewsRequest())
    } else if (parsed.pathname === '/api/photos') {
      sendResult(res, await handlePhotosRequest(apiKey))
    } else {
      next()
    }
  }

  return {
    name: 'mu-api-proxy',
    configureServer(server) {
      server.middlewares.use((req, res, next) => void middleware(req.url, res, next))
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => void middleware(req.url, res, next))
    },
  }
}
