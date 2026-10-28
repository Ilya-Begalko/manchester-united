import type { NewsFeed } from '@/types/news'
import { apiGet } from './apiClient'

export async function fetchNews(options?: { force?: boolean }): Promise<NewsFeed> {
  const feed = await apiGet<NewsFeed>('/news', {}, options)
  return {
    source: feed.source,
    items: feed.items.filter((item) => item.title && item.url && item.publishedAt),
  }
}
