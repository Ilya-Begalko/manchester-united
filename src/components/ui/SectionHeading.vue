<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string
    title: string
    description?: string | null
    dark?: boolean
  }>(),
  { dark: false },
)
</script>

<template>
  <div v-motion-fade-up class="mb-10 flex flex-col gap-6 sm:mb-12 lg:flex-row lg:items-end lg:justify-between">
    <div class="max-w-2xl">
      <p
        v-if="eyebrow"
        class="mb-3 flex items-center gap-3 text-xs font-bold tracking-[0.2em] uppercase text-red"
      >
        <span class="h-px w-8 bg-red" aria-hidden="true" />
        {{ eyebrow }}
      </p>
      <h2
        class="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
        :class="dark ? 'text-white' : 'text-text'"
      >
        {{ title }}
      </h2>
      <p v-if="description" class="mt-4 text-base leading-relaxed" :class="dark ? 'text-white/60' : 'text-muted'">
        {{ description }}
      </p>
    </div>
    <div v-if="$slots.default" class="shrink-0">
      <slot />
    </div>
  </div>
</template>
