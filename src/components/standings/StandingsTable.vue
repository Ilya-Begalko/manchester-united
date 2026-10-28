<script setup lang="ts">
import { computed } from 'vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import TeamCrest from '@/components/ui/TeamCrest.vue'
import { useStandings } from '@/composables/useStandings'
import { MAN_UNITED_ID, ordinalSuffix } from '@/utils/football'

const { data, table, unitedRow, season, loading, error, isEmpty, retry } = useStandings()

const description = computed(() => {
  const parts = [data.value?.competition.name ?? 'Premier League', season.value ? `season ${season.value}` : null]
  const matchday = data.value?.season.currentMatchday
  if (matchday) parts.push(`after matchday ${matchday}`)
  return parts.filter(Boolean).join(' · ')
})

const columns = [
  { key: 'playedGames', short: 'P', label: 'Played' },
  { key: 'won', short: 'W', label: 'Won' },
  { key: 'draw', short: 'D', label: 'Drawn' },
  { key: 'lost', short: 'L', label: 'Lost' },
  { key: 'goalsFor', short: 'GF', label: 'Goals for' },
  { key: 'goalsAgainst', short: 'GA', label: 'Goals against' },
  { key: 'goalDifference', short: 'GD', label: 'Goal difference' },
] as const

const signed = (n: number) => (n > 0 ? `+${n}` : String(n))
</script>

<template>
  <section id="standings" class="container-page section-space">
    <SectionHeading eyebrow="Premier League" title="Standings" :description="description">
      <div
        v-if="unitedRow"
        class="flex items-center gap-4 rounded-2xl border border-red/20 bg-red/5 px-5 py-3"
      >
        <span class="text-4xl font-extrabold text-red tabular-nums">{{ unitedRow.position }}<sup class="text-base">{{ ordinalSuffix(unitedRow.position) }}</sup></span>
        <span class="text-sm leading-tight">
          <span class="block font-bold">Manchester United</span>
          <span class="text-muted">{{ unitedRow.points }} points</span>
        </span>
      </div>
    </SectionHeading>

    <LoadingSkeleton v-if="loading && !table.length" variant="rows" :count="10" />
    <ErrorState
      v-else-if="error && !table.length"
      title="Standings unavailable"
      :message="error"
      :retrying="loading"
      @retry="retry"
    />
    <ErrorState
      v-else-if="isEmpty"
      kind="empty"
      title="Standings unavailable"
      message="The Premier League table for the current season has not been published by the data provider."
    />

    <div v-else v-motion-fade-up class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[640px] border-collapse text-sm">
          <caption class="sr-only">{{ description }}</caption>
          <thead>
            <tr class="border-b border-line text-[11px] font-bold tracking-wider text-muted uppercase">
              <th scope="col" class="w-14 py-4 pl-5 text-left"><abbr title="Position" class="no-underline">Pos</abbr></th>
              <th scope="col" class="sticky left-0 bg-card py-4 pr-4 text-left">Club</th>
              <th v-for="col in columns" :key="col.key" scope="col" class="px-2 py-4 text-center">
                <abbr :title="col.label" class="no-underline">{{ col.short }}</abbr>
              </th>
              <th scope="col" class="py-4 pr-5 pl-2 text-center"><abbr title="Points" class="no-underline">Pts</abbr></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in table"
              :key="row.team.id"
              class="group border-b border-line transition-colors duration-200 last:border-0"
              :class="row.team.id === MAN_UNITED_ID ? 'bg-red/[0.06] hover:bg-red/10' : 'hover:bg-paper'"
              :aria-current="row.team.id === MAN_UNITED_ID ? 'true' : undefined"
            >
              <td class="relative py-3 pl-5 font-bold tabular-nums">
                <span
                  v-if="row.team.id === MAN_UNITED_ID"
                  class="absolute inset-y-0 left-0 w-1 bg-red"
                  aria-hidden="true"
                />
                <span :class="row.team.id === MAN_UNITED_ID ? 'text-red' : 'text-text'">{{ row.position }}</span>
              </td>
              <td
                class="sticky left-0 py-3 pr-4 transition-colors duration-200"
                :class="row.team.id === MAN_UNITED_ID ? 'bg-[#fdf1f0] group-hover:bg-[#fbe6e4]' : 'bg-card group-hover:bg-paper'"
              >
                <div class="flex items-center gap-3">
                  <TeamCrest :src="row.team.crest" :name="row.team.name" :size="24" />
                  <span
                    class="whitespace-nowrap"
                    :class="row.team.id === MAN_UNITED_ID ? 'font-extrabold text-red' : 'font-semibold'"
                  >
                    <span class="hidden sm:inline">{{ row.team.shortName }}</span>
                    <span class="sm:hidden">{{ row.team.tla }}</span>
                  </span>
                </div>
              </td>
              <td
                v-for="col in columns"
                :key="col.key"
                class="px-2 py-3 text-center tabular-nums"
                :class="col.key === 'goalDifference' ? 'font-semibold' : 'text-text/75'"
              >
                {{ col.key === 'goalDifference' ? signed(row[col.key]) : row[col.key] }}
              </td>
              <td class="py-3 pr-5 pl-2 text-center text-base font-extrabold tabular-nums">{{ row.points }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
