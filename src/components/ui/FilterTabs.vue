<script setup lang="ts" generic="T extends string">
defineProps<{
  options: Array<{ value: T; label: string; count?: number }>
  label: string
  dark?: boolean
}>()

const model = defineModel<T>({ required: true })
</script>

<template>
  <div
    class="no-scrollbar -mx-1 flex gap-1 overflow-x-auto p-1"
    role="tablist"
    :aria-label="label"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="tab"
      :aria-selected="model === option.value"
      class="relative shrink-0 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all duration-300"
      :class="
        model === option.value
          ? 'bg-red text-white shadow-[0_6px_20px_-8px_rgba(218,41,28,0.8)]'
          : dark
            ? 'text-white/70 hover:bg-white/10 hover:text-white'
            : 'bg-card text-text ring-1 ring-line hover:ring-text/30'
      "
      @click="model = option.value"
    >
      {{ option.label }}
      <span
        v-if="option.count !== undefined"
        class="ml-1 text-xs tabular-nums"
        :class="model === option.value ? 'text-white/75' : 'text-muted'"
        >{{ option.count }}</span
      >
    </button>
  </div>
</template>
