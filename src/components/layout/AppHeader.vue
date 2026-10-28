<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useEventListener, useWindowScroll } from '@vueuse/core'
import { CalendarClock, Menu, X } from 'lucide-vue-next'
import TeamCrest from '@/components/ui/TeamCrest.vue'
import { useActiveSection } from '@/composables/useActiveSection'
import { useSquad } from '@/composables/useSquad'
import { scrollToSection } from '@/utils/scroll'
import { NAV_ITEMS } from './navigation'

const { y } = useWindowScroll()
const scrolled = computed(() => y.value > 24)
const active = useActiveSection(NAV_ITEMS.map((item) => item.id))
const { club } = useSquad()

const menuOpen = ref(false)

const navRef = ref<HTMLElement | null>(null)
const linkRefs = ref<Record<string, HTMLElement>>({})
const indicator = ref({ left: 0, width: 0, visible: false })

function updateIndicator() {
  const el = linkRefs.value[active.value]
  if (!el || !navRef.value) return
  indicator.value = { left: el.offsetLeft, width: el.offsetWidth, visible: true }
}

watch(active, () => nextTick(updateIndicator))
onMounted(() => {
  updateIndicator()
  document.fonts?.ready.then(updateIndicator)
})
useEventListener(window, 'resize', updateIndicator, { passive: true })
useEventListener(window, 'keydown', (e: KeyboardEvent) => {
  if (e.key === 'Escape') menuOpen.value = false
})

function go(id: string) {
  menuOpen.value = false
  scrollToSection(id)
}

function setLinkRef(id: string, el: unknown) {
  if (el instanceof HTMLElement) linkRefs.value[id] = el
}
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-500"
    :class="
      scrolled || menuOpen
        ? 'bg-ink/90 shadow-[0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl'
        : 'bg-gradient-to-b from-black/60 to-transparent'
    "
  >
    <div
      class="container-page flex items-center justify-between gap-6 transition-[height] duration-500 ease-out-expo"
      :class="scrolled ? 'h-16' : 'h-20 lg:h-24'"
    >
      <a href="#home" class="group flex items-center gap-3" @click.prevent="go('home')">
        <span
          class="transition-transform duration-500 ease-out-expo group-hover:scale-110"
          :class="scrolled ? 'scale-90' : 'scale-100'"
        >
          <TeamCrest v-if="club?.crest" :src="club.crest" :name="club.name" :size="40" eager />
          <span
            v-else
            class="flex size-10 items-center justify-center rounded-full bg-red text-sm font-extrabold text-white"
            aria-hidden="true"
            >MU</span
          >
        </span>
        <span class="leading-none text-white">
          <span class="block text-sm font-extrabold tracking-wide uppercase">Manchester United</span>
          <span class="mt-1 block text-[11px] font-semibold tracking-[0.2em] text-white/50 uppercase">Fan Portal</span>
        </span>
      </a>

      <nav ref="navRef" class="relative hidden items-center lg:flex" aria-label="Main navigation">
        <a
          v-for="item in NAV_ITEMS"
          :key="item.id"
          :ref="(el) => setLinkRef(item.id, el)"
          :href="`#${item.id}`"
          class="relative px-4 py-2 text-sm font-semibold transition-colors duration-300"
          :class="active === item.id ? 'text-red' : 'text-white/75 hover:text-white'"
          :aria-current="active === item.id ? 'true' : undefined"
          @click.prevent="go(item.id)"
        >
          {{ item.label }}
        </a>
        <span
          class="absolute -bottom-0.5 h-0.5 rounded-full bg-red transition-all duration-500 ease-out-expo"
          :class="indicator.visible ? 'opacity-100' : 'opacity-0'"
          :style="{ left: `${indicator.left + 16}px`, width: `${Math.max(indicator.width - 32, 0)}px` }"
          aria-hidden="true"
        />
      </nav>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="group hidden items-center gap-2 rounded-full bg-red px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-dark sm:inline-flex"
          @click="go('next-match')"
        >
          <CalendarClock class="size-4 transition-transform duration-300 group-hover:-rotate-12" aria-hidden="true" />
          Next Match
        </button>
        <button
          type="button"
          class="inline-flex size-11 items-center justify-center rounded-full text-white transition hover:bg-white/10 lg:hidden"
          :aria-expanded="menuOpen"
          aria-controls="mobile-menu"
          :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
          @click="menuOpen = !menuOpen"
        >
          <Transition
            mode="out-in"
            enter-active-class="transition duration-200"
            enter-from-class="rotate-90 opacity-0"
            leave-active-class="transition duration-150"
            leave-to-class="-rotate-90 opacity-0"
          >
            <X v-if="menuOpen" class="size-6" aria-hidden="true" />
            <Menu v-else class="size-6" aria-hidden="true" />
          </Transition>
        </button>
      </div>
    </div>

    <Transition
      enter-active-class="transition-[opacity,transform] duration-300 ease-out-expo"
      enter-from-class="-translate-y-3 opacity-0"
      leave-active-class="transition-[opacity,transform] duration-200"
      leave-to-class="-translate-y-2 opacity-0"
    >
      <nav
        v-if="menuOpen"
        id="mobile-menu"
        class="border-t border-white/10 bg-ink/95 backdrop-blur-xl lg:hidden"
        aria-label="Mobile navigation"
      >
        <ul class="container-page flex flex-col py-4">
          <li v-for="(item, i) in NAV_ITEMS" :key="item.id">
            <a
              :href="`#${item.id}`"
              class="flex items-center justify-between border-b border-white/5 py-4 text-2xl font-extrabold tracking-tight transition-colors"
              :class="active === item.id ? 'text-red' : 'text-white hover:text-red'"
              :style="{ transitionDelay: `${i * 30}ms` }"
              @click.prevent="go(item.id)"
            >
              {{ item.label }}
              <span class="text-xs font-semibold text-white/30">0{{ i + 1 }}</span>
            </a>
          </li>
          <li class="pt-5 sm:hidden">
            <button
              type="button"
              class="inline-flex w-full items-center justify-center gap-2 rounded-full bg-red px-5 py-3.5 text-sm font-bold text-white"
              @click="go('next-match')"
            >
              <CalendarClock class="size-4" aria-hidden="true" />
              Next Match
            </button>
          </li>
        </ul>
      </nav>
    </Transition>
  </header>
</template>
