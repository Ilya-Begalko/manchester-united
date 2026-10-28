<script setup lang="ts">
import { computed } from 'vue'
import { CalendarDays, Clock, MapPin, Trophy } from 'lucide-vue-next'
import ErrorState from '@/components/ui/ErrorState.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import TeamCrest from '@/components/ui/TeamCrest.vue'
import { useMatches } from '@/composables/useMatches'
import { useNow } from '@/composables/useNow'
import { useSquad } from '@/composables/useSquad'
import { countdownTo, formatLongDate, formatRelative, formatTime, timeZoneName } from '@/utils/date'
import { hasConfirmedKickoff, isHome, MAN_UNITED_ID, roundLabel } from '@/utils/football'

const { nextMatch, live, loading, error, isEmpty, retry } = useMatches()
const { club } = useSquad()
const now = useNow()

const match = computed(() => nextMatch.value)
const confirmed = computed(() => (match.value ? hasConfirmedKickoff(match.value) : false))
const countdown = computed(() => (match.value && confirmed.value ? countdownTo(match.value.utcDate, now.value) : null))
const round = computed(() => (match.value ? roundLabel(match.value) : null))

/** Venue is only meaningful when the API provides it, or when United play at home and the club venue is known. */
const venue = computed(() => {
  if (!match.value) return null
  if (match.value.venue) return match.value.venue
  return isHome(match.value) ? (club.value?.venue ?? null) : null
})

const sides = computed(() => (match.value ? [match.value.homeTeam, match.value.awayTeam] : []))
</script>

<template>
  <section id="next-match" class="container-page section-space">
    <SectionHeading eyebrow="Matchday" title="Next Match">
      <p
        v-if="live"
        class="inline-flex items-center gap-2 rounded-full bg-red/10 px-4 py-2 text-sm font-bold text-red"
      >
        <span class="size-2 animate-pulse rounded-full bg-red" aria-hidden="true" />
        Live now: {{ live.homeTeam.shortName }} {{ live.score.home ?? 0 }}–{{ live.score.away ?? 0 }}
        {{ live.awayTeam.shortName }}
      </p>
    </SectionHeading>

    <LoadingSkeleton v-if="loading && !match" variant="block" item-class="h-[26rem]" />
    <ErrorState v-else-if="error && !match" :message="error" :retrying="loading" @retry="retry" />
    <ErrorState
      v-else-if="isEmpty || !match"
      kind="empty"
      title="No upcoming matches"
      message="The data provider has not published any further Manchester United fixtures for this season yet."
    />

    <article
      v-else
      v-motion-fade-up
      class="relative overflow-hidden rounded-3xl bg-ink text-white"
    >
      <div
        class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(218,41,28,0.45),transparent_55%),radial-gradient(circle_at_100%_100%,rgba(139,0,0,0.5),transparent_50%)]"
        aria-hidden="true"
      />
      <div
        class="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:48px_48px]"
        aria-hidden="true"
      />

      <div class="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-6 lg:p-14">
        <template v-for="(team, index) in sides" :key="team.id">
          <div
            class="flex flex-col items-center gap-4 text-center"
            :class="index === 0 ? 'lg:order-1' : 'lg:order-3'"
          >
            <div
              class="flex size-28 items-center justify-center rounded-full bg-white/95 p-4 shadow-2xl transition-transform duration-500 ease-out-expo hover:scale-105 sm:size-36"
              :class="team.id === MAN_UNITED_ID ? 'ring-4 ring-red/60' : ''"
            >
              <TeamCrest :src="team.crest" :name="team.name" :size="96" />
            </div>
            <div>
              <p class="text-xl font-extrabold sm:text-2xl">{{ team.shortName }}</p>
              <p class="mt-1 text-xs font-bold tracking-[0.2em] text-white/45 uppercase">
                {{ index === 0 ? 'Home' : 'Away' }}
              </p>
            </div>
          </div>
        </template>

        <div class="flex flex-col items-center gap-5 lg:order-2 lg:px-6">
          <span class="text-6xl font-extrabold tracking-tighter text-white/90 sm:text-7xl">VS</span>

          <div v-if="countdown" class="flex gap-2" aria-label="Time until kick-off">
            <div
              v-for="unit in [
                { label: 'Days', value: countdown.days },
                { label: 'Hrs', value: countdown.hours },
                { label: 'Min', value: countdown.minutes },
              ]"
              :key="unit.label"
              class="w-16 rounded-xl border border-white/10 bg-white/5 py-2 text-center backdrop-blur"
            >
              <p class="text-2xl font-extrabold tabular-nums">{{ String(unit.value).padStart(2, '0') }}</p>
              <p class="text-[10px] font-bold tracking-widest text-white/45 uppercase">{{ unit.label }}</p>
            </div>
          </div>
          <p v-else class="rounded-full border border-white/15 px-4 py-1.5 text-xs font-semibold text-white/60">
            Kick-off time to be confirmed
          </p>
        </div>
      </div>

      <dl class="relative grid border-t border-white/10 sm:grid-cols-2 lg:grid-cols-4">
        <div class="flex items-start gap-3 border-b border-white/10 p-6 sm:border-r lg:border-b-0">
          <Trophy class="mt-0.5 size-5 shrink-0 text-red" aria-hidden="true" />
          <div>
            <dt class="text-[11px] font-bold tracking-[0.18em] text-white/45 uppercase">Competition</dt>
            <dd class="mt-1 font-bold">{{ match.competition.name }}</dd>
            <dd v-if="round" class="text-sm text-white/55">{{ round }}</dd>
          </div>
        </div>
        <div class="flex items-start gap-3 border-b border-white/10 p-6 lg:border-r lg:border-b-0">
          <CalendarDays class="mt-0.5 size-5 shrink-0 text-red" aria-hidden="true" />
          <div>
            <dt class="text-[11px] font-bold tracking-[0.18em] text-white/45 uppercase">Date</dt>
            <dd class="mt-1 font-bold">{{ formatLongDate(match.utcDate) }}</dd>
            <dd class="text-sm text-white/55">{{ formatRelative(match.utcDate, now) }}</dd>
          </div>
        </div>
        <div class="flex items-start gap-3 border-b border-white/10 p-6 sm:border-r sm:border-b-0">
          <Clock class="mt-0.5 size-5 shrink-0 text-red" aria-hidden="true" />
          <div>
            <dt class="text-[11px] font-bold tracking-[0.18em] text-white/45 uppercase">Kick-off</dt>
            <dd class="mt-1 font-bold">{{ confirmed ? formatTime(match.utcDate) : 'To be confirmed' }}</dd>
            <dd v-if="confirmed" class="text-sm text-white/55">Your local time · {{ timeZoneName() }}</dd>
          </div>
        </div>
        <div class="flex items-start gap-3 p-6">
          <MapPin class="mt-0.5 size-5 shrink-0 text-red" aria-hidden="true" />
          <div>
            <dt class="text-[11px] font-bold tracking-[0.18em] text-white/45 uppercase">Venue</dt>
            <dd class="mt-1 font-bold">{{ venue ?? (isHome(match) ? 'Home' : `Away at ${match.homeTeam.shortName}`) }}</dd>
            <dd class="text-sm text-white/55">{{ isHome(match) ? 'Home fixture' : 'Away fixture' }}</dd>
          </div>
        </div>
      </dl>
    </article>
  </section>
</template>
