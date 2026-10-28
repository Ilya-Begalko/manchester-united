import { shallowRef } from 'vue'

const now = shallowRef(Date.now())
let timer: ReturnType<typeof setInterval> | null = null

/** A single shared clock ticking once a minute; enough for match status and countdowns. */
export function useNow() {
  if (!timer && typeof window !== 'undefined') {
    timer = setInterval(() => (now.value = Date.now()), 60_000)
  }
  return now
}
