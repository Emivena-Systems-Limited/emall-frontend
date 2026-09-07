function filterStoreSearchIndex(stores, query) {
  const needle = String(query ?? '').trim().toLowerCase()
  if (!needle) {
    return stores.map((entry) => entry.id)
  }

  const ids = []
  for (let index = 0; index < stores.length; index += 1) {
    if (stores[index].text.includes(needle)) {
      ids.push(stores[index].id)
    }
  }
  return ids
}

self.onmessage = (event) => {
  const { requestId, query, stores } = event.data ?? {}
  const needle = String(query ?? '').trim().toLowerCase()
  const ids = filterStoreSearchIndex(Array.isArray(stores) ? stores : [], needle)
  self.postMessage({ requestId, ids, query: needle })
}
