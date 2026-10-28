import type { StandingRow, StandingsData } from '@/types/standings'
import { PREMIER_LEAGUE_CODE } from '@/utils/football'
import { footballGet } from './apiClient'

interface RawStandingsResponse {
  competition: StandingsData['competition']
  season: { startDate: string; endDate: string; currentMatchday: number | null }
  standings: Array<{
    stage: string
    type: 'TOTAL' | 'HOME' | 'AWAY'
    group: string | null
    table: Array<Omit<StandingRow, 'team' | 'form'> & { team: StandingRow['team']; form?: string | null }>
  }>
}

export async function fetchPremierLeagueStandings(options?: { force?: boolean }): Promise<StandingsData | null> {
  const data = await footballGet<RawStandingsResponse>(`competitions/${PREMIER_LEAGUE_CODE}/standings`, {}, options)
  const total = data.standings.find((s) => s.type === 'TOTAL')
  if (!total || total.table.length === 0) return null

  return {
    competition: data.competition,
    season: data.season,
    table: total.table.map((row) => ({ ...row, form: row.form ?? null })),
  }
}
