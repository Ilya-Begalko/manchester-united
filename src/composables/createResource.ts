import { computed, shallowRef, type ComputedRef, type ShallowRef } from 'vue'

export interface Resource<T> {
  data: ShallowRef<T | null>
  error: ShallowRef<string | null>
  loading: ShallowRef<boolean>
  /** True once a request has settled at least once. */
  loaded: ShallowRef<boolean>
  isEmpty: ComputedRef<boolean>
  retry: () => Promise<void>
}

/**
 * Creates app-wide shared async state for one data source. The first consumer
 * triggers the request; later consumers reuse the same state, so sections
 * that need the same data never cause duplicate API calls.
 */
export function createResource<T>(
  fetcher: (options: { force: boolean }) => Promise<T>,
  isEmptyValue: (value: T) => boolean = (value) => value == null,
): () => Resource<T> {
  const data = shallowRef<T | null>(null)
  const error = shallowRef<string | null>(null)
  const loading = shallowRef(false)
  const loaded = shallowRef(false)
  let started = false
  let requestId = 0

  async function load(force: boolean) {
    const id = ++requestId
    loading.value = true
    error.value = null
    try {
      const result = await fetcher({ force })
      if (id === requestId) data.value = result
    } catch (err) {
      if (id === requestId) error.value = err instanceof Error ? err.message : 'Failed to load data.'
    } finally {
      if (id === requestId) {
        loading.value = false
        loaded.value = true
      }
    }
  }

  const resource: Resource<T> = {
    data,
    error,
    loading,
    loaded,
    isEmpty: computed(() => loaded.value && !error.value && (data.value === null || isEmptyValue(data.value))),
    retry: () => load(true),
  }

  return () => {
    if (!started) {
      started = true
      void load(false)
    }
    return resource
  }
}
