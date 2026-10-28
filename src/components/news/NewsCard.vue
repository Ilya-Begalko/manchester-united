<script setup lang="ts">
import { ref } from 'vue'
import { ArrowUpRight, Newspaper } from 'lucide-vue-next'
import type { NewsItem } from '@/types/news'
import { formatDate, formatRelative } from '@/utils/date'

withDefaults(defineProps<{ item: NewsItem; featured?: boolean }>(), { featured: false })

const imageFailed = ref(false)
</script>

<template>
  <a
    :href="item.url"
    target="_blank"
    rel="noopener noreferrer"
    class="card group flex h-full overflow-hidden transition duration-500 ease-out-expo hover:-translate-y-1 hover:border-text/15 hover:shadow-[0_24px_48px_-28px_rgba(0,0,0,0.3)]"
    :class="featured ? 'flex-col' : 'flex-col sm:flex-row lg:flex-col xl:flex-row'"
  >
    <div
      class="relative shrink-0 overflow-hidden bg-ink"
      :class="featured ? 'aspect-[16/9]' : 'aspect-[16/9] sm:aspect-auto sm:w-48 lg:aspect-[16/9] lg:w-auto xl:aspect-auto xl:w-44'"
    >
      <img
        v-if="item.image && !imageFailed"
        :src="item.image"
        alt=""
        :width="featured ? 800 : 400"
        :height="featured ? 450 : 225"
        loading="lazy"
        decoding="async"
        class="h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
        @error="imageFailed = true"
      />
      <div v-else class="flex h-full min-h-32 w-full items-center justify-center bg-gradient-to-br from-ink to-red-dark">
        <Newspaper class="size-10 text-white/30" aria-hidden="true" />
      </div>
    </div>

    <div class="flex flex-1 flex-col p-5" :class="{ 'sm:p-8': featured }">
      <p class="mb-3 flex items-center gap-2 text-xs font-semibold text-muted">
        <span class="font-bold text-red">{{ item.source }}</span>
        <span aria-hidden="true">·</span>
        <time :datetime="item.publishedAt" :title="formatDate(item.publishedAt)">{{ formatRelative(item.publishedAt) }}</time>
      </p>
      <h3
        class="font-extrabold tracking-tight text-text transition-colors group-hover:text-red"
        :class="featured ? 'text-2xl leading-tight sm:text-3xl' : 'line-clamp-3 text-base leading-snug'"
      >
        {{ item.title }}
      </h3>
      <p
        v-if="item.summary"
        class="mt-3 text-sm leading-relaxed text-muted"
        :class="featured ? 'line-clamp-3 sm:text-base' : 'line-clamp-2'"
      >
        {{ item.summary }}
      </p>
      <span class="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-bold text-text">
        Read on {{ item.source }}
        <ArrowUpRight
          class="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden="true"
        />
        <span class="sr-only">(opens in a new tab)</span>
      </span>
    </div>
  </a>
</template>
