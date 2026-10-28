<script setup lang="ts">
import type { Component } from 'vue'
import { ArrowUpRight, Github, Linkedin, Mail, Send } from 'lucide-vue-next'
import { scrollToSection } from '@/utils/scroll'
import { NAV_ITEMS } from './navigation'

const year = new Date().getFullYear()

const DEVELOPER_NAME = 'Ilya Begalko'

const developerLinks: Array<{ label: string; href: string; external: boolean; icon: Component }> = [
  { label: 'Telegram', href: 'https://t.me/ilbglk', external: true, icon: Send },
  { label: 'GitHub', href: 'https://github.com/Ilya-Begalko', external: true, icon: Github },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/ilya-begalko/', external: true, icon: Linkedin },
  { label: 'Email', href: 'mailto:ilya.begalko@gmail.com', external: false, icon: Mail },
]

const sources = [
  { label: 'football-data.org', href: 'https://www.football-data.org/', note: 'Fixtures, results, squad, table, scorers' },
  { label: 'BBC Sport RSS', href: 'https://www.bbc.co.uk/sport/football/teams/manchester-united', note: 'Latest news headlines' },
  {
    label: 'Wikimedia Commons',
    href: 'https://commons.wikimedia.org/wiki/File:Oldtraffordstadpano.jpg',
    note: 'Old Trafford photo by LiamUK, CC BY-SA 3.0',
  },
]
</script>

<template>
  <footer class="bg-ink text-white">
    <div class="container-page grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1.4fr] lg:py-20">
      <div>
        <p class="text-3xl font-extrabold tracking-tight">
          Manchester United<br />
          <span class="text-red">Fan Portal</span>
        </p>
        <p class="mt-5 max-w-sm text-sm leading-relaxed text-white/55">
          An independent, non-commercial fan project. Not affiliated with, endorsed by or connected to Manchester
          United Football Club. Club names and crests belong to their respective owners.
        </p>

        <div v-if="developerLinks.length" class="mt-8">
          <p class="mb-3 text-xs font-bold tracking-[0.2em] text-white/40 uppercase">Developer</p>
          <p class="text-sm text-white/55">
            Designed &amp; developed by <span class="font-bold text-white">{{ DEVELOPER_NAME }}</span>
          </p>
          <ul class="mt-4 flex flex-wrap gap-2">
            <li v-for="link in developerLinks" :key="link.href">
              <a
                :href="link.href"
                :target="link.external ? '_blank' : undefined"
                :rel="link.external ? 'noopener noreferrer' : undefined"
                class="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white/75 transition-colors hover:border-red hover:text-white"
              >
                <component :is="link.icon" class="size-4" aria-hidden="true" />
                {{ link.label }}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <nav aria-label="Footer navigation">
        <p class="mb-4 text-xs font-bold tracking-[0.2em] text-white/40 uppercase">Sections</p>
        <ul class="grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-1">
          <li v-for="item in NAV_ITEMS" :key="item.id">
            <a
              :href="`#${item.id}`"
              class="text-sm font-semibold text-white/75 transition-colors hover:text-red"
              @click.prevent="scrollToSection(item.id)"
              >{{ item.label }}</a
            >
          </li>
        </ul>
      </nav>

      <div>
        <p class="mb-4 text-xs font-bold tracking-[0.2em] text-white/40 uppercase">Data sources</p>
        <ul class="space-y-4">
          <li v-for="source in sources" :key="source.href">
            <a
              :href="source.href"
              target="_blank"
              rel="noopener noreferrer"
              class="group inline-flex items-center gap-1.5 text-sm font-bold text-white transition-colors hover:text-red"
            >
              {{ source.label }}
              <ArrowUpRight
                class="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </a>
            <p class="mt-0.5 text-xs text-white/45">{{ source.note }}</p>
          </li>
        </ul>
      </div>
    </div>
    <div class="border-t border-white/10">
      <div class="container-page flex flex-col gap-2 py-6 text-xs text-white/40 sm:flex-row sm:justify-between">
        <p>© {{ year }} Manchester United Fan Portal · Independent fan project</p>
        <p>Football data provided by football-data.org</p>
      </div>
    </div>
  </footer>
</template>
