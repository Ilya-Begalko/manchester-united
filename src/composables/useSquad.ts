import { computed, ref } from 'vue'
import { fetchSquad } from '@/services/squadService'
import type { Player, PositionGroup, SquadData } from '@/types/player'
import { positionGroupLabel } from '@/utils/football'
import { createResource } from './createResource'

const useSquadResource = createResource<SquadData>(fetchSquad, (data) => data.players.length === 0)

const GROUP_ORDER: PositionGroup[] = ['goalkeepers', 'defenders', 'midfielders', 'forwards']

export function useSquad() {
  const resource = useSquadResource()

  const players = computed(() => resource.data.value?.players ?? [])
  const club = computed(() => resource.data.value?.club ?? null)

  return { ...resource, players, club }
}

/** Local (non-persisted) search & position filter state for the Squad section. */
export function useSquadFilters(players: { value: Player[] }) {
  const activeGroup = ref<PositionGroup | 'all'>('all')
  const query = ref('')

  const normalizedQuery = computed(() =>
    query.value.trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, ''),
  )

  const filtered = computed(() =>
    players.value.filter((p) => {
      if (activeGroup.value !== 'all' && p.positionGroup !== activeGroup.value) return false
      if (!normalizedQuery.value) return true
      const name = p.name.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
      return name.includes(normalizedQuery.value)
    }),
  )

  const groups = computed(() => {
    const result = GROUP_ORDER.map((key) => ({
      key,
      label: positionGroupLabel[key],
      players: filtered.value
        .filter((p) => p.positionGroup === key)
        .sort((a, b) => (a.shirtNumber ?? 999) - (b.shirtNumber ?? 999) || a.name.localeCompare(b.name)),
    }))
    const other = filtered.value.filter((p) => p.positionGroup === null)
    if (other.length) result.push({ key: 'other' as PositionGroup, label: 'Other', players: other })
    return result.filter((g) => g.players.length > 0)
  })

  const counts = computed(() => {
    const map: Record<PositionGroup | 'all', number> = { all: players.value.length, goalkeepers: 0, defenders: 0, midfielders: 0, forwards: 0 }
    for (const p of players.value) if (p.positionGroup) map[p.positionGroup]++
    return map
  })

  return { activeGroup, query, filtered, groups, counts }
}
