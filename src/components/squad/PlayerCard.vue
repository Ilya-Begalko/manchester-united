<script setup lang="ts">
import { computed } from 'vue'
import { Flag, Goal } from 'lucide-vue-next'
import type { Player } from '@/types/player'
import type { TopScorer } from '@/types/statistics'
import { formatDate } from '@/utils/date'
import { initials } from '@/utils/football'

const props = defineProps<{
  player: Player
  /** Premier League scoring record, when the player appears in the scorers list. */
  scoring?: TopScorer | null
}>()

const age = computed(() => {
  if (!props.player.dateOfBirth) return null
  const dob = new Date(props.player.dateOfBirth)
  if (Number.isNaN(dob.getTime())) return null
  const now = new Date()
  let years = now.getFullYear() - dob.getFullYear()
  const beforeBirthday = now.getMonth() < dob.getMonth() || (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate())
  if (beforeBirthday) years--
  return years
})

const nameParts = computed(() => {
  const [first, ...rest] = props.player.name.split(' ')
  return { first, last: rest.join(' ') }
})
</script>

<template>
  <article
    class="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition duration-500 ease-out-expo hover:-translate-y-1.5 hover:border-red/50 hover:bg-white/[0.07]"
  >
    <div class="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-red-dark via-[#3a0a07] to-ink" role="img" :aria-label="`No photo available for ${player.name}`">
      <div
        class="absolute inset-0 flex items-center justify-center transition-transform duration-700 ease-out-expo group-hover:scale-110"
        aria-hidden="true"
      >
        <svg viewBox="0 0 120 120" class="absolute bottom-0 h-[92%] text-black/35" fill="currentColor">
          <circle cx="60" cy="38" r="22" />
          <path d="M14 120c0-28 20.6-46 46-46s46 18 46 46z" />
        </svg>
        <span class="relative text-5xl font-extrabold tracking-tight text-white/90">{{ initials(player.name) }}</span>
      </div>
      <span
        v-if="player.shirtNumber !== null"
        class="absolute top-4 left-4 text-4xl font-extrabold text-white/90 tabular-nums"
        >{{ player.shirtNumber }}</span
      >
      <span
        v-if="player.position"
        class="absolute top-4 right-4 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white/80 uppercase backdrop-blur"
        >{{ player.position }}</span
      >
    </div>

    <div class="flex flex-1 flex-col p-5">
      <h4 class="leading-tight">
        <span v-if="nameParts.last" class="block text-sm font-semibold text-white/60">{{ nameParts.first }}</span>
        <span class="block text-lg font-extrabold text-white">{{ nameParts.last || nameParts.first }}</span>
      </h4>

      <p v-if="player.nationality" class="mt-3 inline-flex items-center gap-1.5 text-sm text-white/55">
        <Flag class="size-3.5" aria-hidden="true" />
        {{ player.nationality }}
      </p>

      <div
        class="grid grid-rows-[0fr] opacity-0 transition-all duration-500 ease-out-expo group-hover:grid-rows-[1fr] group-hover:opacity-100 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100 max-lg:grid-rows-[1fr] max-lg:opacity-100"
      >
        <dl class="overflow-hidden">
          <div class="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 text-xs">
            <div v-if="age !== null">
              <dt class="text-white/40">Age</dt>
              <dd class="mt-0.5 font-bold text-white">{{ age }}</dd>
            </div>
            <div v-if="player.dateOfBirth">
              <dt class="text-white/40">Born</dt>
              <dd class="mt-0.5 font-bold text-white">{{ formatDate(player.dateOfBirth) }}</dd>
            </div>
            <template v-if="scoring">
              <div>
                <dt class="inline-flex items-center gap-1 text-white/40"><Goal class="size-3" aria-hidden="true" />PL goals</dt>
                <dd class="mt-0.5 font-bold text-red">{{ scoring.goals }}</dd>
              </div>
              <div v-if="scoring.assists !== null">
                <dt class="text-white/40">PL assists</dt>
                <dd class="mt-0.5 font-bold text-white">{{ scoring.assists }}</dd>
              </div>
            </template>
          </div>
        </dl>
      </div>
    </div>
  </article>
</template>
