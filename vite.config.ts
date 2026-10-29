import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite'
import { publishStaticData } from './server/staticData.ts'
import { apiProxy } from './server/vitePlugin.ts'

/** Project pages are served from /<repo>/. A user site (owner.github.io) stays at /. */
function siteBase(): string {
  if (!process.env.GITHUB_ACTIONS) return '/'
  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]
  const owner = process.env.GITHUB_REPOSITORY_OWNER
  if (!repo || repo === `${owner}.github.io`) return '/'
  return `/${repo}/`
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiKey = process.env.FOOTBALL_DATA_API_KEY || env.FOOTBALL_DATA_API_KEY

  return {
    base: siteBase(),
    plugins: [vue(), tailwindcss(), apiProxy(apiKey), publishStaticData(apiKey)],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
  }
})
