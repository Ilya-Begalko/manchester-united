import type { NewsFeed } from '@/types/news'
import { newsGet } from './apiClient'

export async function fetchNews(options?: { force?: boolean }): Promise<NewsFeed> {
  const feed = await newsGet<NewsFeed>(options)
  return {
    source: feed.source,
    items: feed.items.filter((item) => item.title && item.url && item.publishedAt),
  }
}
