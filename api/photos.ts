import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handlePhotosRequest } from '../server/photos.js'
import { sendResult } from '../server/http.js'

/** A cold run searches players one by one to respect TheSportsDB's 30 req/min limit. */
export const config = { maxDuration: 60 }

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  sendResult(res, await handlePhotosRequest(process.env.FOOTBALL_DATA_API_KEY))
}
