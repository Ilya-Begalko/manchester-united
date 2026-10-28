<script setup lang="ts">
import { AlertTriangle, Inbox, RotateCw } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    kind?: 'error' | 'empty'
    title?: string
    message?: string | null
    retrying?: boolean
    dark?: boolean
  }>(),
  { kind: 'error', retrying: false, dark: false },
)

defineEmits<{ retry: [] }>()
</script>

<template>
  <div
    class="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-6 py-12 text-center"
    :class="dark ? 'border-white/15 text-white/70' : 'border-line bg-card/60 text-muted'"
    :role="kind === 'error' ? 'alert' : 'status'"
  >
    <component
      :is="kind === 'error' ? AlertTriangle : Inbox"
      class="size-8"
      :class="kind === 'error' ? 'text-red' : dark ? 'text-white/40' : 'text-muted/70'"
      aria-hidden="true"
    />
    <p class="text-base font-bold" :class="dark ? 'text-white' : 'text-text'">
      {{ title ?? (kind === 'error' ? 'Data could not be loaded' : 'Nothing to show yet') }}
    </p>
    <p v-if="message" class="max-w-md text-sm leading-relaxed">{{ message }}</p>
    <button
      v-if="kind === 'error'"
      type="button"
      class="group mt-2 inline-flex items-center gap-2 rounded-full bg-red px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-dark disabled:opacity-60"
      :disabled="retrying"
      @click="$emit('retry')"
    >
      <RotateCw
        class="size-4 transition-transform duration-500 group-hover:rotate-180"
        :class="{ 'animate-spin': retrying }"
        aria-hidden="true"
      />
      Try again
    </button>
  </div>
</template>
