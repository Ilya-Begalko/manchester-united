<script setup lang="ts">
import { computed } from 'vue'
import { useWindowScroll, useWindowSize } from '@vueuse/core'
import { ArrowDown, ArrowRight, MapPin } from 'lucide-vue-next'
import heroLarge from '@/assets/images/old-trafford-1920.jpg'
import heroSmall from '@/assets/images/old-trafford-1280.jpg'
import TeamCrest from '@/components/ui/TeamCrest.vue'
import { useMatches } from '@/composables/useMatches'
import { useReducedMotion } from '@/composables/useReducedMotion'
import { formatLongDate, formatTime } from '@/utils/date'
import { hasConfirmedKickoff, isHome, opponentOf } from '@/utils/football'
import { scrollToSection } from '@/utils/scroll'

const { nextMatch, season, loading, error, loaded } = useMatches()

const { y } = useWindowScroll()
const { height } = useWindowSize()
const reducedMotion = useReducedMotion()

const parallax = computed(() => {
  if (reducedMotion.value || y.value > height.value) return undefined
  return { transform: `translate3d(0, ${y.value * 0.3}px, 0) scale(1.08)` }
})

const opponent = computed(() => (nextMatch.value ? opponentOf(nextMatch.value) : null))
</script>

<template>
  <section id="home" class="relative isolate flex min-h-[100svh] overflow-hidden bg-ink text-white">
    <div class="absolute inset-0 -z-10" aria-hidden="true">
      <img
        :src="heroLarge"
        :srcset="`${heroSmall} 1280w, ${heroLarge} 1920w`"
        sizes="100vw"
        width="1920"
        height="823"
        alt=""
        fetchpriority="high"
        class="h-full w-full scale-[1.08] object-cover object-center opacity-55 will-change-transform"
        :style="parallax"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />
      <div class="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/30 to-transparent" />
      <div class="absolute -bottom-40 -left-40 size-[36rem] rounded-full bg-red/25 blur-[120px]" />
    </div>

    <div class="container-page flex flex-col justify-end pt-32 pb-12 sm:pb-16 lg:pb-20">
      <div class="max-w-5xl">
        <p
          v-motion-hero-in
          :delay="100"
          class="mb-6 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-bold tracking-[0.2em] uppercase backdrop-blur"
        >
          <span class="size-1.5 rounded-full bg-red" aria-hidden="true" />
          <span v-if="season">Season {{ season }}</span>
          <span v-else-if="loading" class="skeleton inline-block h-3 w-20 bg-white/15" />
          <span v-else>Old Trafford · Manchester</span>
        </p>

        <h1
          v-motion-hero-in
          :delay="200"
          class="text-[clamp(3.25rem,11vw,10rem)] leading-[0.85] font-extrabold tracking-[-0.04em] uppercase"
        >
          Manchester<br />
          <span class="text-red">United</span>
        </h1>

        <p v-motion-hero-in :delay="350" class="mt-6 text-xl font-semibold text-white/80 sm:text-2xl">
          The Red Devils
        </p>
        <p v-motion-hero-in :delay="450" class="mt-3 max-w-xl text-base leading-relaxed text-white/55">
          Fixtures, results, the first-team squad, the Premier League table and the latest headlines — live from
          real football data.
        </p>

        <div v-motion-hero-in :delay="550" class="mt-10 flex flex-wrap items-center gap-3">
          <button
            type="button"
            class="group inline-flex items-center gap-2 rounded-full bg-red px-7 py-4 text-sm font-bold tracking-wide text-white uppercase transition hover:bg-white hover:text-red"
            @click="scrollToSection('fixtures')"
          >
            View Fixtures
            <ArrowRight class="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-4 text-sm font-bold tracking-wide text-white uppercase transition hover:border-white hover:bg-white/10"
            @click="scrollToSection('squad')"
          >
            Meet the Squad
          </button>
        </div>
      </div>

      <div
        v-motion-hero-in
        :delay="700"
        class="mt-14 grid gap-4 border-t border-white/10 pt-8 lg:grid-cols-[1fr_auto] lg:items-end"
      >
        <div v-if="nextMatch && opponent" class="flex flex-wrap items-center gap-x-6 gap-y-3">
          <p class="text-xs font-bold tracking-[0.2em] text-white/45 uppercase">Next match</p>
          <div class="flex items-center gap-3">
            <TeamCrest :src="opponent.crest" :name="opponent.name" :size="32" eager />
            <p class="text-lg font-extrabold">
              {{ isHome(nextMatch) ? 'vs' : '@' }} {{ opponent.shortName }}
            </p>
          </div>
          <p class="text-sm text-white/70">
            {{ formatLongDate(nextMatch.utcDate) }}
            <template v-if="hasConfirmedKickoff(nextMatch)"> · {{ formatTime(nextMatch.utcDate) }}</template>
          </p>
          <p class="inline-flex items-center gap-1.5 text-sm text-white/50">
            <MapPin class="size-4" aria-hidden="true" />
            {{ nextMatch.competition.name }} · {{ isHome(nextMatch) ? 'Home' : 'Away' }}
          </p>
        </div>
        <div v-else-if="loading" class="skeleton h-8 w-full max-w-xl bg-white/10" />
        <p v-else-if="error" class="text-sm text-white/50">Next match information is currently unavailable.</p>
        <p v-else-if="loaded" class="text-sm text-white/50">No upcoming matches are scheduled yet.</p>

        <button
          type="button"
          class="group hidden items-center gap-2 text-xs font-bold tracking-[0.2em] text-white/50 uppercase transition hover:text-white lg:inline-flex"
          @click="scrollToSection('next-match')"
        >
          Scroll
          <ArrowDown class="size-4 transition-transform duration-300 group-hover:translate-y-1" aria-hidden="true" />
        </button>
      </div>
    </div>
  </section>
</template>
