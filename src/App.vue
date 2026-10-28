<script setup lang="ts">
import HeroSection from '@/components/home/HeroSection.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import FixturesSection from '@/components/matches/FixturesSection.vue'
import LatestResults from '@/components/matches/LatestResults.vue'
import NextMatch from '@/components/matches/NextMatch.vue'
import NewsSection from '@/components/news/NewsSection.vue'
import SquadSection from '@/components/squad/SquadSection.vue'
import StandingsTable from '@/components/standings/StandingsTable.vue'
import StatisticsSection from '@/components/statistics/StatisticsSection.vue'
</script>

<template>
  <a
    href="#main"
    class="sr-only z-[60] rounded-full bg-red px-4 py-2 font-bold text-white focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
    >Skip to content</a
  >
  <AppHeader />
  <main id="main" class="overflow-x-clip">
    <HeroSection />
    <section id="matches" aria-label="Matches">
      <NextMatch />
      <LatestResults />
      <FixturesSection />
    </section>
    <SquadSection />
    <StandingsTable />
    <StatisticsSection />
    <NewsSection />
  </main>
  <AppFooter />
</template>
