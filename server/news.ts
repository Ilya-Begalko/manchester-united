import { XMLParser } from 'fast-xml-parser'
import { cached, type ProxyResult } from './cache.js'

const FEED_URL = 'https://feeds.bbci.co.uk/sport/football/teams/manchester-united/rss.xml'
const SOURCE_NAME = 'BBC Sport'
const TTL = 15 * 60
const MAX_ITEMS = 6

interface RssItem {
  title?: string
  description?: string
  link?: string
  pubDate?: string
  guid?: string | { '#text'?: string }
  'media:thumbnail'?: { '@_url'?: string } | Array<{ '@_url'?: string }>
}

export interface NewsItemDto {
  id: string
  title: string
  summary: string | null
  url: string
  publishedAt: string
  image: string | null
  source: string
}

/** BBC image CDN serves the same picture at several widths; request a sharper one than the 240px thumbnail. */
function upscaleImage(url: string | undefined): string | null {
  if (!url) return null
  return url.replace(/\/standard\/\d+\//, '/standard/800/')
}

function toDto(item: RssItem): NewsItemDto | null {
  const title = item.title?.trim()
  const url = item.link?.trim()
  const date = item.pubDate ? new Date(item.pubDate) : null
  if (!title || !url || !date || Number.isNaN(date.getTime())) return null

  const thumb = Array.isArray(item['media:thumbnail']) ? item['media:thumbnail'][0] : item['media:thumbnail']
  const guid = typeof item.guid === 'string' ? item.guid : item.guid?.['#text']

  return {
    id: guid ?? url,
    title,
    summary: item.description?.trim() || null,
    url,
    publishedAt: date.toISOString(),
    image: upscaleImage(thumb?.['@_url']),
    source: SOURCE_NAME,
  }
}

export function handleNewsRequest(): Promise<ProxyResult> {
  return cached(FEED_URL, TTL, async () => {
    const response = await fetch(FEED_URL, { signal: AbortSignal.timeout(10_000) })
    if (!response.ok) {
      return { status: 502, body: { message: 'News feed is unavailable.' }, ttl: 0 }
    }

    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' })
    const xml = parser.parse(await response.text())
    const rawItems: RssItem[] = [xml?.rss?.channel?.item ?? []].flat()

    const items = rawItems
      .map(toDto)
      .filter((item): item is NewsItemDto => item !== null)
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .slice(0, MAX_ITEMS)

    return {
      status: 200,
      body: { source: { name: SOURCE_NAME, url: 'https://www.bbc.co.uk/sport/football/teams/manchester-united' }, items },
      ttl: TTL,
    }
  })
}
