import type { SquadData } from '@/types/player'
import { MAN_UNITED_ID, toPositionGroup } from '@/utils/football'
import { footballGet } from './apiClient'

interface RawTeamResponse {
  id: number
  name: string
  shortName: string
  crest: string | null
  venue: string | null
  founded: number | null
  website: string | null
  coach?: { name: string | null } | null
  squad?: Array<{
    id: number
    name: string
    position: string | null
    dateOfBirth: string | null
    nationality: string | null
    shirtNumber?: number | null
  }>
}

export async function fetchSquad(options?: { force?: boolean }): Promise<SquadData> {
  const data = await footballGet<RawTeamResponse>(`teams/${MAN_UNITED_ID}`, {}, options)

  return {
    club: {
      id: data.id,
      name: data.name,
      shortName: data.shortName,
      crest: data.crest,
      venue: data.venue,
      founded: data.founded,
      website: data.website,
      coach: data.coach?.name ?? null,
    },
    players: (data.squad ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      position: p.position,
      positionGroup: toPositionGroup(p.position),
      nationality: p.nationality,
      dateOfBirth: p.dateOfBirth,
      shirtNumber: p.shirtNumber ?? null,
    })),
  }
}
