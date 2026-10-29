import type { PlayerPhoto } from '@/types/photo'

const portraits = import.meta.glob('../../public/images/players/*.jpg', { eager: true, query: '?url' })

/** Public files are served from the site root, not from `/public/...`. */
const photoSlugs = new Set(
  Object.keys(portraits)
    .map((path) => path.split('/').pop()?.replace(/\.jpg$/, '') ?? '')
    .filter(Boolean),
)

/** `Benjamin Šeško` → `benjamin-sesko`, matching the filename in `public/images/players`. */
function playerSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Local portrait for a squad player, or null when that file was not provided. */
export function playerPhoto(name: string): PlayerPhoto | null {
  const slug = playerSlug(name)
  if (!photoSlugs.has(slug)) return null
  return { url: `${import.meta.env.BASE_URL}images/players/${slug}.jpg` }
}
