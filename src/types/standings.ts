import type { Competition, Season, Team } from './match'

export interface StandingRow {
  position: number
  team: Team
  playedGames: number
  won: number
  draw: number
  lost: number
  points: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  form: string | null
}

export interface StandingsData {
  competition: Competition
  season: Season & { currentMatchday: number | null }
  table: StandingRow[]
}
