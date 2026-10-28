/** Match statuses as returned by football-data.org v4. */
export type MatchStatus =
  | 'SCHEDULED'
  | 'TIMED'
  | 'IN_PLAY'
  | 'PAUSED'
  | 'EXTRA_TIME'
  | 'PENALTY_SHOOTOUT'
  | 'FINISHED'
  | 'SUSPENDED'
  | 'POSTPONED'
  | 'CANCELLED'
  | 'AWARDED'

export interface Team {
  id: number
  name: string
  shortName: string
  tla: string
  crest: string | null
}

export interface Competition {
  id: number
  code: string
  name: string
  emblem: string | null
}

export interface Season {
  startDate: string
  endDate: string
}

export interface Match {
  id: number
  utcDate: string
  status: MatchStatus
  matchday: number | null
  stage: string | null
  group: string | null
  venue: string | null
  competition: Competition
  season: Season | null
  homeTeam: Team
  awayTeam: Team
  score: {
    winner: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null
    duration: 'REGULAR' | 'EXTRA_TIME' | 'PENALTY_SHOOTOUT' | null
    home: number | null
    away: number | null
  }
}

export type MatchOutcome = 'win' | 'draw' | 'loss'

export type FixtureFilter = 'upcoming' | 'completed' | 'all'
