const inflight = new Map()

/** Collapse concurrent identical async work into a single in-flight promise. */
export function dedupeAsync(key, fn) {
  const cacheKey = String(key)
  if (inflight.has(cacheKey)) {
    return inflight.get(cacheKey)
  }

  const promise = Promise.resolve()
    .then(fn)
    .finally(() => {
      inflight.delete(cacheKey)
    })

  inflight.set(cacheKey, promise)
  return promise
}
