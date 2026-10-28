<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight } from 'lucide-vue-next'
import ErrorState from '@/components/ui/ErrorState.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import { useMatches } from '@/composables/useMatches'
import { outcomeLabel, outcomeOf } from '@/utils/football'
import { scrollToSection } from '@/utils/scroll'
import MatchCard from './MatchCard.vue'

const LIMIT = 4

const { completed, loading, error, loaded, retry } = useMatches()

const latest = computed(() => completed.value.slice(0, LIMIT))

/** Last five outcomes, oldest first, for the form strip. */
const form = computed(() =>
  completed.value
    .slice(0, 5)
    .map((m) => ({ id: m.id, outcome: outcomeOf(m) }))
    .filter((f): f is { id: number; outcome: NonNullable<typeof f.outcome> } => f.outcome !== null)
    .reverse(),
)
</script>

<template>
  <section id="results" class="container-page section-space pt-0 sm:pt-0 lg:pt-0">
    <SectionHeading eyebrow="Results" title="Latest Results">
      <div class="flex flex-wrap items-center gap-4">
        <div v-if="form.length" class="flex items-center gap-2">
          <span class="text-xs font-bold tracking-[0.18em] text-muted uppercase">Form</span>
          <ol class="flex gap-1">
            <li
              v-for="f in form"
              :key="f.id"
              class="flex size-7 items-center justify-center rounded-md text-xs font-extrabold"
              :class="{
                'bg-win text-white': f.outcome === 'win',
                'bg-black/10 text-text': f.outcome === 'draw',
                'bg-red text-white': f.outcome === 'loss',
              }"
              :title="outcomeLabel[f.outcome]"
            >
              {{ outcomeLabel[f.outcome][0] }}
            </li>
          </ol>
        </div>
        <button
          v-if="completed.length > LIMIT"
          type="button"
          class="group inline-flex items-center gap-2 text-sm font-bold text-red transition hover:text-red-dark"
          @click="scrollToSection('fixtures')"
        >
          View All
          <ArrowRight class="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
        </button>
      </div>
    </SectionHeading>

    <LoadingSkeleton v-if="loading && !latest.length" :count="LIMIT" item-class="h-52" />
    <ErrorState v-else-if="error && !latest.length" :message="error" :retrying="loading" @retry="retry" />
    <ErrorState
      v-else-if="loaded && !latest.length"
      kind="empty"
      title="No completed matches yet"
      message="Results will appear here once Manchester United have played their first match of the season."
    />
    <ul v-else class="no-scrollbar -mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
      <li
        v-for="(match, i) in latest"
        :key="match.id"
        v-motion-fade-up
        :delay="i * 80"
        class="w-[82%] shrink-0 snap-start sm:w-auto"
      >
        <MatchCard :match="match" />
      </li>
    </ul>
  </section>
</template>
