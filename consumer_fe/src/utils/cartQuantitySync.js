const syncByLine = new Map()

/**
 * Coalesce rapid quantity updates for the same line into one trailing API call.
 * Local Redux updates stay immediate; only the network sync is merged.
 */
export async function coalesceQuantitySync(lineItemId, quantity, syncFn) {
  const key = String(lineItemId)
  const nextQuantity = Math.max(1, Number(quantity) || 1)
  const existing = syncByLine.get(key)

  if (existing) {
    existing.quantity = nextQuantity
    return existing.promise
  }

  const state = { quantity: nextQuantity }
  const promise = (async () => {
    while (true) {
      const targetQuantity = state.quantity
      const response = await syncFn(targetQuantity)
      if (state.quantity === targetQuantity) {
        return response
      }
    }
  })().finally(() => {
    syncByLine.delete(key)
  })

  syncByLine.set(key, { quantity: nextQuantity, promise })
  return promise
}
