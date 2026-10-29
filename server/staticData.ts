import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { Plugin } from 'vite'
import type { ProxyResult } from './cache.js'
import { handleFootballRequest } from './football.js'
import { handleNewsRequest } from './news.js'

/** Paths match `MAN_UNITED_ID` (66) and `PREMIER_LEAGUE_CODE` (`PL`) in `src/utils/football.ts`. */
const DATASETS: Array<{ file: string; load: (apiKey: string | undefined) => Promise<ProxyResult> }> = [
  { file: 'matches.json', load: (apiKey) => handleFootballRequest('teams/66/matches', {}, apiKey) },
  { file: 'team.json', load: (apiKey) => handleFootballRequest('teams/66', {}, apiKey) },
  { file: 'standings.json', load: (apiKey) => handleFootballRequest('competitions/PL/standings', {}, apiKey) },
  { file: 'scorers.json', load: (apiKey) => handleFootballRequest('competitions/PL/scorers', { limit: '100' }, apiKey) },
  { file: 'news.json', load: () => handleNewsRequest() },
]

/**
 * GitHub Pages only serves files. During `vite build` the same server handlers
 * used by the dev proxy download the data and write it into `dist/data`, so the
 * API key never enters the browser bundle.
 */
export function publishStaticData(apiKey: string | undefined): Plugin {
  let outDir = 'dist'

  return {
    name: 'publish-static-data',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    async closeBundle() {
      const dir = path.join(outDir, 'data')
      await mkdir(dir, { recursive: true })

      for (const dataset of DATASETS) {
        const result = await dataset.load(apiKey)
        if (result.status !== 200) {
          const message = (result.body as { message?: string }).message ?? `status ${result.status}`
          throw new Error(`Failed to fetch ${dataset.file}: ${message}`)
        }
        await writeFile(path.join(dir, dataset.file), JSON.stringify(result.body))
      }
    },
  }
}
