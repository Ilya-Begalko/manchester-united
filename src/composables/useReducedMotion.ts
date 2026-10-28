import { useMediaQuery } from '@vueuse/core'

export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)')

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
