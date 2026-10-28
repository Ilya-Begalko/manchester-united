<script setup lang="ts">
import { computed } from 'vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'
import PlayerAvatar from '@/components/ui/PlayerAvatar.vue'
import { usePlayerPhotos } from '@/composables/usePlayerPhotos'
import { useTopScorers } from '@/composables/useStatistics'

const { data, top, hasAssists, season, loading, error, loaded, retry } = useTopScorers()
const { photoFor } = usePlayerPhotos()

const scope = computed(() =>
  [data.value?.competition.name ?? 'Premier League', season.value].filter(Boolean).join(' · '),
)
</script>

<template>
  <div>
    <div class="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
      <h3 class="text-2xl font-extrabold tracking-tight sm:text-3xl">Top Scorers</h3>
      <p class="text-sm text-white/50">{{ scope }} only — other competitions are not included.</p>
    </div>

    <LoadingSkeleton v-if="loading && !top.length" variant="cards" :count="5" grid="grid-cols-1" item-class="h-16" dark />
    <ErrorState
      v-else-if="error && !top.length"
      title="Player statistics unavailable"
      :message="error"
      :retrying="loading"
      dark
      @retry="retry"
    />
    <ErrorState
      v-else-if="loaded && !top.length"
      kind="empty"
      title="No scorer data yet"
      message="No Manchester United player appears in the league scorer list provided by the API yet."
      dark
    />

    <ol v-else class="overflow-hidden rounded-2xl border border-white/10">
      <li
        v-for="(player, i) in top"
        :key="player.playerId"
        v-motion-fade-up
        :delay="i * 70"
        class="group grid grid-cols-[2rem_3rem_1fr_auto] items-center gap-3 border-b border-white/10 px-4 py-4 transition-colors last:border-0 hover:bg-white/[0.05] sm:grid-cols-[2.5rem_3.5rem_1fr_auto] sm:gap-4 sm:px-6"
      >
        <span class="text-lg font-extrabold text-white/35 tabular-nums" :class="{ 'text-red': i === 0 }">
          {{ i + 1 }}
        </span>
        <PlayerAvatar :name="player.name" :photo="photoFor(player.playerId)" />
        <div class="min-w-0">
          <p class="truncate font-bold text-white">{{ player.name }}</p>
          <p class="truncate text-xs text-white/50">
            {{ [player.position, player.playedMatches !== null ? `${player.playedMatches} apps` : null].filter(Boolean).join(' · ') }}
          </p>
        </div>
        <dl class="flex gap-5 text-right sm:gap-8">
          <div>
            <dt class="text-[10px] font-bold tracking-widest text-white/40 uppercase">Goals</dt>
            <dd class="text-2xl font-extrabold text-white tabular-nums">{{ player.goals }}</dd>
          </div>
          <div v-if="hasAssists">
            <dt class="text-[10px] font-bold tracking-widest text-white/40 uppercase">Assists</dt>
            <dd class="text-2xl font-extrabold text-white/80 tabular-nums">{{ player.assists ?? '—' }}</dd>
          </div>
        </dl>
      </li>
    </ol>
  </div>
</template>
