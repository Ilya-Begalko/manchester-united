import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleFootballRequest } from '../server/football.js'
import { sendResult, toQuery } from '../server/http.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const query = toQuery(req.query)
  const result = await handleFootballRequest(query.path, query, process.env.FOOTBALL_DATA_API_KEY)
  sendResult(res, result)
}
