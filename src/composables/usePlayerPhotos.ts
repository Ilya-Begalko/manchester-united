import { computed } from 'vue'
import { fetchPlayerPhotos } from '@/services/photosService'
import type { PlayerPhoto, PlayerPhotos } from '@/types/photo'
import { createResource } from './createResource'

const usePhotosResource = createResource<PlayerPhotos>(
  fetchPlayerPhotos,
  (data) => Object.keys(data.photos).length === 0,
)

/** Photos are optional decoration: errors are swallowed and cards keep their placeholders. */
export function usePlayerPhotos() {
  const resource = usePhotosResource()
  const source = computed(() => resource.data.value?.source ?? null)
  const count = computed(() => Object.keys(resource.data.value?.photos ?? {}).length)
  const photoFor = (playerId: number): PlayerPhoto | null => resource.data.value?.photos[playerId] ?? null
  return { source, count, photoFor, loaded: resource.loaded }
}
