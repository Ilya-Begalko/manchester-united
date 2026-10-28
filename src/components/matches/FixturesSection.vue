<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ChevronDown, Info } from 'lucide-vue-next'
import ErrorState from '@/components/ui/ErrorState.vue'
import FilterTabs from '@/components/ui/FilterTabs.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import { useMatches } from '@/composables/useMatches'
import type { FixtureFilter } from '@/types/match'
import MatchCard from './MatchCard.vue'

const PAGE_SIZE = 8

const { matches, upcoming, completed, competitions, season, loading, error, loaded, retry } = useMatches()

const filter = ref<FixtureFilter>('upcoming')
const competition = ref<string>('all')
const visible = ref(PAGE_SIZE)

const byCompetition = <T extends { competition: { code: string } }>(list: T[]) =>
  competition.value === 'all' ? list : list.filter((m) => m.competition.code === competition.value)

const filtered = computed(() => {
  if (filter.value === 'upcoming') return byCompetition(upcoming.value)
  if (filter.value === 'completed') return byCompetition(completed.value)
  return byCompetition(matches.value)
})

const shown = computed(() => filtered.value.slice(0, visible.value))

watch([filter, competition], () => (visible.value = PAGE_SIZE))

const tabs = computed(() => [
  { value: 'upcoming' as const, label: 'Upcoming', count: byCompetition(upcoming.value).length },
  { value: 'completed' as const, label: 'Completed', count: byCompetition(completed.value).length },
  { value: 'all' as const, label: 'All Matches', count: byCompetition(matches.value).length },
])

const competitionOptions = computed(() => [
  { value: 'all', label: 'All competitions' },
  ...competitions.value.map((c) => ({ value: c.code, label: c.name })),
])

const emptyMessage = computed(() => {
  if (filter.value === 'upcoming') return 'No upcoming fixtures for this selection have been published yet.'
  if (filter.value === 'completed') return 'No completed matches for this selection yet.'
  return 'No matches found for this selection.'
})
</script>

<template>
  <section id="fixtures" class="bg-card/60 border-y border-line">
    <div class="container-page section-space">
      <SectionHeading
        eyebrow="Calendar"
        title="Fixtures"
        :description="season ? `All Manchester United matches of the ${season} season available from the data provider.` : null"
      />

      <div v-motion-fade-up class="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <FilterTabs v-model="filter" :options="tabs" label="Match status" />
        <label v-if="competitionOptions.length > 2" class="relative inline-flex w-full md:w-auto">
          <span class="sr-only">Competition</span>
          <select
            v-model="competition"
            class="w-full cursor-pointer appearance-none rounded-full bg-card py-2.5 pr-10 pl-4 text-sm font-semibold ring-1 ring-line transition hover:ring-text/30 md:w-64"
          >
            <option v-for="opt in competitionOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
          <ChevronDown class="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
        </label>
      </div>

      <LoadingSkeleton v-if="loading && !matches.length" :count="8" item-class="h-52" />
      <ErrorState v-else-if="error && !matches.length" :message="error" :retrying="loading" @retry="retry" />
      <template v-else-if="loaded">
        <Transition
          mode="out-in"
          enter-active-class="transition duration-300 ease-out-expo"
          enter-from-class="translate-y-2 opacity-0"
          leave-active-class="transition duration-150"
          leave-to-class="opacity-0"
        >
          <ErrorState v-if="!filtered.length" :key="`empty-${filter}-${competition}`" kind="empty" :message="emptyMessage" />
          <ul v-else :key="`${filter}-${competition}`" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <li v-for="match in shown" :key="match.id">
              <MatchCard :match="match" />
            </li>
          </ul>
        </Transition>

        <div v-if="filtered.length > visible" class="mt-10 flex justify-center">
          <button
            type="button"
            class="group inline-flex items-center gap-2 rounded-full border border-text px-7 py-3.5 text-sm font-bold uppercase tracking-wide transition hover:bg-text hover:text-white"
            @click="visible += PAGE_SIZE"
          >
            Show More
            <span class="text-muted group-hover:text-white/60">({{ filtered.length - visible }})</span>
            <ChevronDown class="size-4 transition-transform duration-300 group-hover:translate-y-0.5" aria-hidden="true" />
          </button>
        </div>

        <p class="mt-8 flex items-start gap-2 text-xs leading-relaxed text-muted">
          <Info class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Only competitions covered by the football-data.org free plan are listed, so domestic cup ties may be
          missing. Times are shown in your local time zone.
        </p>
      </template>
    </div>
  </section>
</template>
