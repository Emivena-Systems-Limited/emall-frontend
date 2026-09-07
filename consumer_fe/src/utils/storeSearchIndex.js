function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && String(value).trim() !== '')
}

export function buildStoreSearchIndex(stores = []) {
  return stores.map((store) => {
    const address = store.address && typeof store.address === 'object' ? store.address : null

    return {
      id: String(store.id),
      text: [
        store.name,
        store.store_name,
        store.tradingName,
        store.trading_name,
        store.city,
        store.region,
        typeof store.address === 'string' ? store.address : null,
        address?.address,
        address?.city,
        address?.city_or_town,
        address?.street_name,
        address?.landmark,
        address?.gps_address,
        ...(store.serviceAreas ?? store.service_areas ?? []),
      ]
        .map((value) => String(value ?? '').trim())
        .filter(Boolean)
        .join(' ')
        .toLowerCase(),
    }
  })
}

export function filterStoreSearchIndex(searchIndex, query) {
  const needle = String(query ?? '').trim().toLowerCase()
  if (!needle) {
    return searchIndex.map((entry) => entry.id)
  }

  return searchIndex
    .filter((entry) => entry.text.includes(needle))
    .map((entry) => entry.id)
}

export function pickStoresByIds(stores, ids) {
  if (!ids?.length) return []
  const idSet = new Set(ids.map(String))
  return stores.filter((store) => idSet.has(String(store.id)))
}
