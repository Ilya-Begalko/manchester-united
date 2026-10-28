import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleNewsRequest } from '../server/news.js'
import { sendResult } from '../server/http.js'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  sendResult(res, await handleNewsRequest())
}
