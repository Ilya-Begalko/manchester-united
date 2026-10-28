<script setup lang="ts">
import { computed } from 'vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import { useClubStatistics } from '@/composables/useStatistics'
import { ordinalSuffix } from '@/utils/football'
import StatCard from './StatCard.vue'
import TopPlayers from './TopPlayers.vue'

const { data, season, loading, error, isEmpty, retry } = useClubStatistics()

const description = computed(() => {
  if (!data.value) return 'Season figures from the official league table.'
  const scope = [data.value.competition.name, season.value].filter(Boolean).join(' ')
  return `${scope} record — currently ${data.value.position}${ordinalSuffix(data.value.position)} in the table.`
})
</script>

<template>
  <section id="statistics" class="bg-ink text-white">
    <div class="container-page section-space">
      <SectionHeading eyebrow="By the numbers" title="Statistics" :description="description" dark />

      <LoadingSkeleton
        v-if="loading && !data"
        :count="8"
        item-class="h-40"
        grid="grid-cols-2 md:grid-cols-4"
        dark
      />
      <ErrorState
        v-else-if="error && !data"
        title="Club statistics unavailable"
        :message="error"
        :retrying="loading"
        dark
        @retry="retry"
      />
      <ErrorState
        v-else-if="isEmpty || !data"
        kind="empty"
        title="Club statistics unavailable"
        message="Manchester United could not be found in the current league table, so no season figures are shown."
        dark
      />
      <ul v-else class="grid auto-rows-fr grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <li v-for="(stat, i) in data.stats" :key="stat.key" v-motion-fade-up :delay="i * 60">
          <StatCard :stat="stat" />
        </li>
      </ul>

      <div class="mt-20">
        <TopPlayers />
      </div>
    </div>
  </section>
</template>
