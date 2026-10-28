import { computed } from 'vue'
import { fetchNews } from '@/services/newsService'
import type { NewsFeed } from '@/types/news'
import { createResource } from './createResource'

const useNewsResource = createResource<NewsFeed>(fetchNews, (feed) => feed.items.length === 0)

export function useNews() {
  const resource = useNewsResource()
  const items = computed(() => resource.data.value?.items ?? [])
  const featured = computed(() => items.value[0] ?? null)
  const rest = computed(() => items.value.slice(1))
  const source = computed(() => resource.data.value?.source ?? null)
  return { ...resource, items, featured, rest, source }
}
