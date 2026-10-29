<script setup lang="ts">
import { computed } from 'vue'
import { Search, X } from 'lucide-vue-next'
import ErrorState from '@/components/ui/ErrorState.vue'
import FilterTabs from '@/components/ui/FilterTabs.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import { useSquad, useSquadFilters } from '@/composables/useSquad'
import { useTopScorers } from '@/composables/useStatistics'
import type { PositionGroup } from '@/types/player'
import { positionGroupLabel } from '@/utils/football'
import { playerPhoto } from '@/utils/playerPhoto'
import PlayerCard from './PlayerCard.vue'

const { players, club, loading, error, loaded, retry } = useSquad()
const { byPlayerId } = useTopScorers()
const visiblePlayers = computed(() => players.value.filter((player) => playerPhoto(player.name)))
const { activeGroup, query, filtered, groups, counts } = useSquadFilters(visiblePlayers)

const tabs = computed(() => [
  { value: 'all' as const, label: 'All', count: counts.value.all },
  ...(Object.keys(positionGroupLabel) as PositionGroup[]).map((key) => ({
    value: key,
    label: positionGroupLabel[key],
    count: counts.value[key],
  })),
])

const description = computed(() => {
  if (!club.value) return 'The current first-team squad.'
  return club.value.coach ? `The current first-team squad under ${club.value.coach}.` : 'The current first-team squad.'
})
</script>

<template>
  <section id="squad" class="bg-ink text-white">
    <div class="container-page section-space">
      <SectionHeading eyebrow="First Team" title="Squad" :description="description" dark />

      <div v-motion-fade-up class="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <FilterTabs v-model="activeGroup" :options="tabs" label="Filter by position" dark />
        <label class="relative block w-full lg:w-80">
          <span class="sr-only">Search players by name</span>
          <Search class="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/40" aria-hidden="true" />
          <input
            v-model="query"
            type="search"
            placeholder="Search player…"
            autocomplete="off"
            class="w-full rounded-full border border-white/10 bg-white/5 py-3 pr-10 pl-11 text-sm text-white placeholder:text-white/35 transition focus:border-red focus:bg-white/10 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          <button
            v-if="query"
            type="button"
            class="absolute top-1/2 right-3 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
            aria-label="Clear search"
            @click="query = ''"
          >
            <X class="size-4" aria-hidden="true" />
          </button>
        </label>
      </div>

      <LoadingSkeleton
        v-if="loading && !players.length"
        :count="8"
        item-class="h-80"
        grid="grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        dark
      />
      <ErrorState v-else-if="error && !players.length" :message="error" :retrying="loading" dark @retry="retry" />
      <ErrorState
        v-else-if="loaded && !players.length"
        kind="empty"
        title="Squad unavailable"
        message="The data provider has not published the current squad list."
        dark
      />
      <template v-else-if="loaded">
        <p class="sr-only" aria-live="polite">{{ filtered.length }} players shown</p>
        <ErrorState
          v-if="!filtered.length"
          kind="empty"
          title="No players found"
          :message="query ? `Nobody in the squad matches “${query}”.` : 'No players in this position group.'"
          dark
        />
        <TransitionGroup
          v-else
          tag="div"
          class="space-y-14"
          enter-active-class="transition duration-500 ease-out-expo"
          enter-from-class="opacity-0 translate-y-3"
          leave-active-class="hidden"
        >
          <div v-for="group in groups" :key="group.key">
            <h3 class="mb-5 flex items-baseline gap-3 border-b border-white/10 pb-3">
              <span class="text-2xl font-extrabold tracking-tight">{{ group.label }}</span>
              <span class="text-sm font-semibold text-white/40 tabular-nums">{{ group.players.length }}</span>
            </h3>
            <TransitionGroup
              tag="ul"
              class="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              move-class="transition duration-500 ease-out-expo"
              enter-active-class="transition duration-500 ease-out-expo"
              enter-from-class="opacity-0 scale-95"
              leave-active-class="hidden"
            >
              <li v-for="player in group.players" :key="player.id">
                <PlayerCard :player="player" :scoring="byPlayerId.get(player.id) ?? null" :photo="playerPhoto(player.name)" />
              </li>
            </TransitionGroup>
          </div>
        </TransitionGroup>
      </template>
    </div>
  </section>
</template>
