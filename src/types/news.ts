export interface NewsItem {
  id: string
  title: string
  summary: string | null
  url: string
  publishedAt: string
  image: string | null
  source: string
}

export interface NewsFeed {
  source: { name: string; url: string }
  items: NewsItem[]
}
