import { computed } from 'vue'
import { fetchPremierLeagueStandings } from '@/services/standingsService'
import type { StandingsData } from '@/types/standings'
import { MAN_UNITED_ID, seasonLabel } from '@/utils/football'
import { createResource } from './createResource'

const useStandingsResource = createResource<StandingsData | null>(
  fetchPremierLeagueStandings,
  (data) => !data || data.table.length === 0,
)

export function useStandings() {
  const resource = useStandingsResource()

  const table = computed(() => resource.data.value?.table ?? [])
  const unitedRow = computed(() => table.value.find((row) => row.team.id === MAN_UNITED_ID) ?? null)
  const season = computed(() => seasonLabel(resource.data.value?.season))

  return { ...resource, table, unitedRow, season }
}
