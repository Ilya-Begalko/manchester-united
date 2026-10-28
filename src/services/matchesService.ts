import type { Match, MatchStatus } from '@/types/match'
import { MAN_UNITED_ID } from '@/utils/football'
import { footballGet } from './apiClient'

interface RawTeam {
  id: number | null
  name: string | null
  shortName: string | null
  tla: string | null
  crest: string | null
}

interface RawMatch {
  id: number
  utcDate: string
  status: MatchStatus
  matchday: number | null
  stage: string | null
  group: string | null
  venue?: string | null
  competition: { id: number; code: string; name: string; emblem: string | null }
  season?: { startDate: string; endDate: string } | null
  homeTeam: RawTeam
  awayTeam: RawTeam
  score: {
    winner: Match['score']['winner']
    duration: Match['score']['duration']
    fullTime: { home: number | null; away: number | null }
  }
}

interface RawMatchesResponse {
  matches: RawMatch[]
}

function mapTeam(team: RawTeam) {
  const name = team.name ?? 'To be decided'
  return {
    id: team.id ?? -1,
    name,
    shortName: team.shortName ?? name,
    tla: team.tla ?? 'TBD',
    crest: team.crest,
  }
}

function mapMatch(raw: RawMatch): Match {
  return {
    id: raw.id,
    utcDate: raw.utcDate,
    status: raw.status,
    matchday: raw.matchday,
    stage: raw.stage,
    group: raw.group,
    venue: raw.venue ?? null,
    competition: raw.competition,
    season: raw.season ?? null,
    homeTeam: mapTeam(raw.homeTeam),
    awayTeam: mapTeam(raw.awayTeam),
    score: {
      winner: raw.score.winner,
      duration: raw.score.duration,
      home: raw.score.fullTime.home,
      away: raw.score.fullTime.away,
    },
  }
}

/**
 * One request returns every Manchester United match of the current season
 * across all competitions covered by the API plan.
 */
export async function fetchTeamMatches(options?: { force?: boolean }): Promise<Match[]> {
  const data = await footballGet<RawMatchesResponse>(`teams/${MAN_UNITED_ID}/matches`, {}, options)
  return data.matches.map(mapMatch).sort((a, b) => a.utcDate.localeCompare(b.utcDate))
}
