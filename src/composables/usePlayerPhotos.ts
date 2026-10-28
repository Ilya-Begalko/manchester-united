import { computed, watch } from 'vue'
import { fetchPlayerPhotos } from '@/services/photosService'
import type { PlayerPhoto, PlayerPhotos } from '@/types/photo'
import { createResource } from './createResource'

const POLL_INTERVAL_MS = 30_000
const MAX_POLLS = 6

const usePhotosResource = createResource<PlayerPhotos>(
  fetchPlayerPhotos,
  (data) => Object.keys(data.photos).length === 0,
)

let polling = false

/** Photos are optional decoration: errors are swallowed and cards keep their placeholders. */
export function usePlayerPhotos() {
  const resource = usePhotosResource()

  if (!polling) {
    polling = true
    let polls = 0
    watch(resource.data, (data) => {
      if (data?.pending && polls < MAX_POLLS) {
        polls++
        setTimeout(() => void resource.retry(), POLL_INTERVAL_MS)
      }
    })
  }

  const photoFor = (playerId: number): PlayerPhoto | null => resource.data.value?.photos[playerId] ?? null
  const count = computed(() => Object.keys(resource.data.value?.photos ?? {}).length)
  return { count, photoFor }
}
