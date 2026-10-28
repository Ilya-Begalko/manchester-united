import { onBeforeUnmount, onMounted, ref } from 'vue'

/** Tracks which page section currently sits under the fixed header. */
export function useActiveSection(ids: string[], offset = 120) {
  const active = ref(ids[0])

  function update() {
    let current = ids[0]
    for (const id of ids) {
      const el = document.getElementById(id)
      if (el && el.getBoundingClientRect().top - offset <= 0) current = id
    }
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      current = ids[ids.length - 1]
    }
    active.value = current
  }

  let frame = 0
  const onScroll = () => {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(update)
  }

  onMounted(() => {
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    update()
  })
  onBeforeUnmount(() => {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
    cancelAnimationFrame(frame)
  })

  return active
}
