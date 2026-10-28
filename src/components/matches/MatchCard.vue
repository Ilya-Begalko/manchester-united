<script setup lang="ts">
import { computed } from 'vue'
import TeamCrest from '@/components/ui/TeamCrest.vue'
import type { Match } from '@/types/match'
import { formatShortDate, formatTime, formatWeekday } from '@/utils/date'
import {
  hasConfirmedKickoff,
  isCompleted,
  isHome,
  isLive,
  MAN_UNITED_ID,
  outcomeLabel,
  outcomeOf,
  roundLabel,
  statusLabel,
} from '@/utils/football'

const props = defineProps<{ match: Match }>()

const completed = computed(() => isCompleted(props.match))
const live = computed(() => isLive(props.match))
const outcome = computed(() => outcomeOf(props.match))
const disrupted = computed(() => ['POSTPONED', 'CANCELLED', 'SUSPENDED'].includes(props.match.status))
const round = computed(() => roundLabel(props.match))

const outcomeClasses = {
  win: 'bg-win text-white',
  draw: 'bg-black/10 text-text',
  loss: 'bg-red text-white',
} as const

const teams = computed(() => [
  { team: props.match.homeTeam, score: props.match.score.home },
  { team: props.match.awayTeam, score: props.match.score.away },
])
</script>

<template>
  <article
    class="card group relative flex h-full flex-col overflow-hidden p-5 transition duration-300 ease-out-expo hover:-translate-y-1 hover:scale-[1.01] hover:border-text/15 hover:shadow-[0_20px_40px_-24px_rgba(0,0,0,0.25)]"
  >
    <span
      v-if="outcome"
      class="absolute inset-y-0 left-0 w-1"
      :class="{ 'bg-win': outcome === 'win', 'bg-black/20': outcome === 'draw', 'bg-red': outcome === 'loss' }"
      aria-hidden="true"
    />

    <header class="mb-5 flex items-start justify-between gap-3">
      <div class="flex min-w-0 items-center gap-2">
        <TeamCrest :src="match.competition.emblem" :name="match.competition.name" :size="20" />
        <div class="min-w-0">
          <p class="truncate text-xs font-bold tracking-wide text-text uppercase">{{ match.competition.name }}</p>
          <p v-if="round" class="truncate text-xs text-muted">{{ round }}</p>
        </div>
      </div>
      <span
        class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ring-1"
        :class="isHome(match) ? 'text-red ring-red/30' : 'text-muted ring-line'"
      >
        {{ isHome(match) ? 'Home' : 'Away' }}
      </span>
    </header>

    <ul class="flex-1 space-y-3">
      <li v-for="row in teams" :key="row.team.id" class="flex items-center gap-3">
        <TeamCrest :src="row.team.crest" :name="row.team.name" :size="28" />
        <span
          class="min-w-0 flex-1 truncate text-[15px]"
          :class="row.team.id === MAN_UNITED_ID ? 'font-extrabold text-text' : 'font-semibold text-text/80'"
        >
          {{ row.team.shortName }}
        </span>
        <span v-if="completed || live" class="text-xl font-extrabold tabular-nums">{{ row.score ?? '–' }}</span>
      </li>
    </ul>

    <footer class="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4 text-xs">
      <time :datetime="match.utcDate" class="font-semibold text-muted">
        <span class="text-text">{{ formatWeekday(match.utcDate).slice(0, 3) }}, {{ formatShortDate(match.utcDate) }}</span>
        <template v-if="!completed && !disrupted">
          · {{ hasConfirmedKickoff(match) ? formatTime(match.utcDate) : 'Time TBC' }}
        </template>
      </time>

      <span
        v-if="outcome"
        class="rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase"
        :class="outcomeClasses[outcome]"
      >
        {{ outcomeLabel[outcome] }}
      </span>
      <span
        v-else-if="live"
        class="inline-flex items-center gap-1.5 rounded-full bg-red/10 px-2.5 py-1 text-[11px] font-bold text-red uppercase"
      >
        <span class="size-1.5 animate-pulse rounded-full bg-red" aria-hidden="true" />
        {{ statusLabel(match.status) }}
      </span>
      <span
        v-else
        class="rounded-full px-2.5 py-1 text-[11px] font-bold uppercase"
        :class="disrupted ? 'bg-amber-100 text-amber-800' : 'bg-black/5 text-muted'"
      >
        {{ statusLabel(match.status) }}
      </span>
    </footer>
  </article>
</template>
