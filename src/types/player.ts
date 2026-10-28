export type PositionGroup = 'goalkeepers' | 'defenders' | 'midfielders' | 'forwards'

export interface Player {
  id: number
  name: string
  /** Position label exactly as provided by the API. */
  position: string | null
  positionGroup: PositionGroup | null
  nationality: string | null
  dateOfBirth: string | null
  shirtNumber: number | null
}

export interface ClubInfo {
  id: number
  name: string
  shortName: string
  crest: string | null
  venue: string | null
  founded: number | null
  website: string | null
  coach: string | null
}

export interface SquadData {
  club: ClubInfo
  players: Player[]
}
