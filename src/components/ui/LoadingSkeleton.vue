<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'cards' | 'rows' | 'block'
    count?: number
    /** Tailwind grid classes for the `cards` variant. */
    grid?: string
    itemClass?: string
    dark?: boolean
  }>(),
  { variant: 'cards', count: 4, grid: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4', itemClass: 'h-40', dark: false },
)
</script>

<template>
  <div role="status" aria-live="polite" :class="{ '[&_.skeleton]:bg-white/10': dark }">
    <span class="sr-only">Loading…</span>

    <div v-if="variant === 'cards'" class="grid gap-4" :class="grid">
      <div v-for="i in count" :key="i" class="skeleton rounded-2xl" :class="itemClass" />
    </div>

    <div v-else-if="variant === 'rows'" class="card divide-y divide-line overflow-hidden">
      <div v-for="i in count" :key="i" class="flex items-center gap-4 px-5 py-4">
        <div class="skeleton h-4 w-6" />
        <div class="skeleton size-7 rounded-full" />
        <div class="skeleton h-4 flex-1" />
        <div class="skeleton hidden h-4 w-48 sm:block" />
        <div class="skeleton h-4 w-10" />
      </div>
    </div>

    <div v-else class="skeleton rounded-3xl" :class="itemClass" />
  </div>
</template>
