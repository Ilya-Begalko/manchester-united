<script setup lang="ts">
import type { ClubStat } from '@/types/statistics'

defineProps<{ stat: ClubStat }>()
</script>

<template>
  <div
    class="group flex h-full flex-col justify-between gap-6 rounded-2xl border p-5 transition duration-500 ease-out-expo hover:-translate-y-1 sm:p-6"
    :class="
      stat.accent
        ? 'border-red bg-red text-white hover:bg-red-dark'
        : 'border-white/10 bg-white/[0.04] text-white hover:border-white/25 hover:bg-white/[0.07]'
    "
  >
    <p
      class="text-xs font-bold tracking-[0.18em] uppercase"
      :class="stat.accent ? 'text-white/80' : 'text-white/50'"
    >
      {{ stat.label }}
    </p>
    <p class="text-5xl leading-none font-extrabold tracking-tight tabular-nums sm:text-6xl">
      {{ stat.signed && stat.value > 0 ? `+${stat.value}` : stat.value }}
    </p>
  </div>
</template>
