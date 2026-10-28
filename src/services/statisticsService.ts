import type { ClubStatistics, TopScorersData } from '@/types/statistics'
import { MAN_UNITED_ID, PREMIER_LEAGUE_CODE } from '@/utils/football'
import { footballGet } from './apiClient'
import { fetchPremierLeagueStandings } from './standingsService'

/**
 * Club figures come straight from the official league table rather than being
 * recomputed from match scores, so they always match the Standings section.
 */
export async function fetchClubStatistics(options?: { force?: boolean }): Promise<ClubStatistics | null> {
  const standings = await fetchPremierLeagueStandings(options)
  const row = standings?.table.find((r) => r.team.id === MAN_UNITED_ID)
  if (!standings || !row) return null

  return {
    competition: standings.competition,
    season: standings.season,
    position: row.position,
    stats: [
      { key: 'played', label: 'Played', value: row.playedGames },
      { key: 'won', label: 'Wins', value: row.won },
      { key: 'draw', label: 'Draws', value: row.draw },
      { key: 'lost', label: 'Losses', value: row.lost },
      { key: 'gf', label: 'Goals Scored', value: row.goalsFor },
      { key: 'ga', label: 'Goals Conceded', value: row.goalsAgainst },
      { key: 'gd', label: 'Goal Difference', value: row.goalDifference, signed: true },
      { key: 'pts', label: 'Points', value: row.points, accent: true },
    ],
  }
}

interface RawScorersResponse {
  competition: TopScorersData['competition']
  season: TopScorersData['season']
  scorers: Array<{
    player: { id: number; name: string; position?: string | null; section?: string | null; nationality: string | null }
    team: { id: number }
    playedMatches?: number | null
    goals: number | null
    assists: number | null
    penalties: number | null
  }>
}

/** League-wide scorer list (one request), filtered down to Manchester United players, sorted by goals. */
export async function fetchUnitedScorers(options?: { force?: boolean }): Promise<TopScorersData> {
  const data = await footballGet<RawScorersResponse>(`competitions/${PREMIER_LEAGUE_CODE}/scorers`, { limit: 100 }, options)

  const players = data.scorers
    .filter((s) => s.team.id === MAN_UNITED_ID && typeof s.goals === 'number')
    .map((s) => ({
      playerId: s.player.id,
      name: s.player.name,
      position: s.player.position ?? s.player.section ?? null,
      nationality: s.player.nationality,
      playedMatches: s.playedMatches ?? null,
      goals: s.goals as number,
      assists: s.assists,
      penalties: s.penalties,
    }))
    .sort((a, b) => b.goals - a.goals || (b.assists ?? 0) - (a.assists ?? 0))

  return { competition: data.competition, season: data.season, players }
}
