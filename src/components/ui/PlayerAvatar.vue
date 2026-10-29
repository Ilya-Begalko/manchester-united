<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PlayerPhoto } from '@/types/photo'
import { initials } from '@/utils/football'

const props = defineProps<{ name: string; photo?: PlayerPhoto | null }>()

const failed = ref(false)
watch(
  () => props.photo?.url,
  () => (failed.value = false),
)
</script>

<template>
  <img
    v-if="photo && !failed"
    :src="photo.url"
    :alt="name"
    width="56"
    height="56"
    loading="lazy"
    decoding="async"
    class="size-12 rounded-full bg-gradient-to-br from-red-dark to-ink object-cover object-top ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-110 sm:size-14"
    @error="failed = true"
  />
  <span
    v-else
    class="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-red-dark to-ink text-sm font-extrabold text-white ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-110 sm:size-14"
    role="img"
    :aria-label="`No photo available for ${name}`"
    >{{ initials(name) }}</span
  >
</template>
