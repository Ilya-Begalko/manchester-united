import { computed } from 'vue'
import { fetchTeamMatches } from '@/services/matchesService'
import type { Match } from '@/types/match'
import { isCompleted, isLive, isUpcoming, seasonLabel } from '@/utils/football'
import { createResource } from './createResource'
import { useNow } from './useNow'

const useMatchesResource = createResource<Match[]>(fetchTeamMatches, (matches) => matches.length === 0)

export function useMatches() {
  const resource = useMatchesResource()
  const now = useNow()

  const matches = computed(() => resource.data.value ?? [])

  const upcoming = computed(() => matches.value.filter((m) => isUpcoming(m, now.value)))

  const completed = computed(() =>
    matches.value.filter(isCompleted).sort((a, b) => b.utcDate.localeCompare(a.utcDate)),
  )

  const live = computed(() => matches.value.find(isLive) ?? null)

  const nextMatch = computed(() => upcoming.value[0] ?? null)

  const competitions = computed(() => {
    const map = new Map<string, Match['competition']>()
    for (const m of matches.value) map.set(m.competition.code, m.competition)
    return [...map.values()]
  })

  const season = computed(() => seasonLabel(matches.value.find((m) => m.season)?.season))

  return { ...resource, matches, upcoming, completed, live, nextMatch, competitions, season }
}
