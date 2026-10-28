import { prefersReducedMotion } from '@/composables/useReducedMotion'

/** Section offsets for the fixed header are handled by `scroll-margin-top` on each section. */
export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
}
