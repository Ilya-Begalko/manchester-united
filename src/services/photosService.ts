import type { PlayerPhotos } from '@/types/photo'
import { apiGet } from './apiClient'

/** Photos are matched to squad players on the server (birth date + name), so only verified ones arrive here. */
export function fetchPlayerPhotos(options?: { force?: boolean }): Promise<PlayerPhotos> {
  return apiGet<PlayerPhotos>('/photos', {}, options)
}
