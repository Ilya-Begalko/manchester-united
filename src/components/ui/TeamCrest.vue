<script setup lang="ts">
import { ref, watch } from 'vue'
import { Shield } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    src: string | null
    name: string
    size?: number
    eager?: boolean
  }>(),
  { size: 32, eager: false },
)

const failed = ref(false)
watch(
  () => props.src,
  () => (failed.value = false),
)
</script>

<template>
  <img
    v-if="src && !failed"
    :src="src"
    :alt="`${name} crest`"
    :width="size"
    :height="size"
    :loading="eager ? 'eager' : 'lazy'"
    decoding="async"
    class="shrink-0 object-contain"
    :style="{ width: `${size}px`, height: `${size}px` }"
    @error="failed = true"
  />
  <span
    v-else
    class="inline-flex shrink-0 items-center justify-center rounded-full bg-black/5 text-muted"
    :style="{ width: `${size}px`, height: `${size}px` }"
    role="img"
    :aria-label="`${name} crest unavailable`"
  >
    <Shield :style="{ width: `${size * 0.55}px`, height: `${size * 0.55}px` }" aria-hidden="true" />
  </span>
</template>
