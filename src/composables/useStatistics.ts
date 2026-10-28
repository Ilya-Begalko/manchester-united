import { computed } from 'vue'
import { fetchClubStatistics, fetchUnitedScorers } from '@/services/statisticsService'
import type { ClubStatistics, TopScorer, TopScorersData } from '@/types/statistics'
import { seasonLabel } from '@/utils/football'
import { createResource } from './createResource'

const TOP_LIMIT = 5

const useClubStatsResource = createResource<ClubStatistics | null>(fetchClubStatistics, (data) => !data)

const useScorersResource = createResource<TopScorersData>(fetchUnitedScorers, (data) => data.players.length === 0)

export function useClubStatistics() {
  const resource = useClubStatsResource()
  const season = computed(() => seasonLabel(resource.data.value?.season))
  return { ...resource, season }
}

export function useTopScorers() {
  const resource = useScorersResource()
  const season = computed(() => seasonLabel(resource.data.value?.season))
  const top = computed(() => resource.data.value?.players.slice(0, TOP_LIMIT) ?? [])
  const hasAssists = computed(() => top.value.some((p) => p.assists !== null))

  const byPlayerId = computed(() => {
    const map = new Map<number, TopScorer>()
    for (const p of resource.data.value?.players ?? []) map.set(p.playerId, p)
    return map
  })

  return { ...resource, season, top, hasAssists, byPlayerId }
}
