<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next'
import ErrorState from '@/components/ui/ErrorState.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import { useNews } from '@/composables/useNews'
import NewsCard from './NewsCard.vue'

const { featured, rest, source, loading, error, isEmpty, retry } = useNews()
</script>

<template>
  <section id="news" class="container-page section-space">
    <SectionHeading eyebrow="Headlines" title="Latest News" description="The latest Manchester United stories from around the web.">
      <a
        v-if="source"
        :href="source.url"
        target="_blank"
        rel="noopener noreferrer"
        class="group inline-flex items-center gap-1.5 text-sm font-bold text-red transition hover:text-red-dark"
      >
        More on {{ source.name }}
        <ArrowUpRight class="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
      </a>
    </SectionHeading>

    <div v-if="loading && !featured" class="grid gap-4 lg:grid-cols-2">
      <LoadingSkeleton variant="block" item-class="h-[28rem]" />
      <LoadingSkeleton :count="3" grid="grid-cols-1" item-class="h-36" />
    </div>
    <ErrorState
      v-else-if="error && !featured"
      title="News currently unavailable"
      :message="error"
      :retrying="loading"
      @retry="retry"
    />
    <ErrorState v-else-if="isEmpty || !featured" kind="empty" title="News currently unavailable" />

    <div v-else class="grid gap-4 lg:grid-cols-2">
      <div v-motion-fade-up>
        <NewsCard :item="featured" featured />
      </div>
      <ul class="grid gap-4">
        <li v-for="(item, i) in rest.slice(0, 3)" :key="item.id" v-motion-fade-up :delay="100 + i * 80">
          <NewsCard :item="item" />
        </li>
      </ul>
      <ul v-if="rest.length > 3" class="grid gap-4 sm:grid-cols-2 lg:col-span-2">
        <li v-for="(item, i) in rest.slice(3)" :key="item.id" v-motion-fade-up :delay="i * 80">
          <NewsCard :item="item" />
        </li>
      </ul>
    </div>
  </section>
</template>
