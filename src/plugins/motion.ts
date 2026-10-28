import { MotionPlugin } from '@vueuse/motion'
import type { App } from 'vue'
import { prefersReducedMotion } from '@/composables/useReducedMotion'

const ease = [0.16, 1, 0.3, 1]

/**
 * Global presets usable as `v-motion-fade-up` / `v-motion-fade`.
 * With reduced motion enabled every preset collapses to an instant, transform-free state.
 */
export function installMotion(app: App) {
  const reduced = prefersReducedMotion()
  const still = { initial: { opacity: 1 }, visibleOnce: { opacity: 1 } }

  app.use(MotionPlugin, {
    directives: {
      'fade-up': reduced
        ? still
        : {
            initial: { opacity: 0, y: 28 },
            visibleOnce: { opacity: 1, y: 0, transition: { duration: 700, ease } },
          },
      fade: reduced
        ? still
        : {
            initial: { opacity: 0 },
            visibleOnce: { opacity: 1, transition: { duration: 800, ease } },
          },
      'hero-in': reduced
        ? { initial: { opacity: 1 }, enter: { opacity: 1 } }
        : {
            initial: { opacity: 0, y: 36 },
            enter: { opacity: 1, y: 0, transition: { duration: 900, ease } },
          },
    },
  })
}
