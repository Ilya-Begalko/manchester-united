import type { Competition, Season } from './match'

export interface ClubStat {
  key: string
  label: string
  value: number
  accent?: boolean
  /** Prefix a "+" for positive values (goal difference). */
  signed?: boolean
}

export interface ClubStatistics {
  competition: Competition
  season: Season
  position: number
  stats: ClubStat[]
}

export interface TopScorer {
  playerId: number
  name: string
  position: string | null
  nationality: string | null
  playedMatches: number | null
  goals: number
  /** null when the provider does not report assists for this player. */
  assists: number | null
  penalties: number | null
}

export interface TopScorersData {
  competition: Competition
  season: Season
  players: TopScorer[]
}
