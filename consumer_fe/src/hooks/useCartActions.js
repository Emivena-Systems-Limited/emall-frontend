import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { notify } from '../lib/notify'
import {
  addItem,
  buildCartItem,
  clearCart,
  clearGuestCartId,
  clearSavedItems,
  moveSavedToCart,
  preserveCartDisplayFields,
  removeItem,
  removeSavedItem,
  replaceItems,
  saveForLater,
  selectCartItems,
  setGuestCartId,
  setQuantity,
  setSelected,
  upsertItem,
} from '../store/slices/cartSlice'
import {
  addGuestProductToCart,
  addItemToCart,
  ensureAuthenticatedCart,
  removeCartItem,
  removeGuestCartItem,
  updateCartItemQuantity,
  updateGuestCartItem,
  updateCartItemSelection,
} from '../services/cartService'
import { persistor, store } from '../store/store'
import {
  buildAddToCartPayload,
  buildUpdateCartQuantityPayload,
  canSyncToApi,
  extractCartItems,
  extractGuestCartId,
  mergeGuestAddItemWithLocal,
  parseAddToCartResponse,
  resolveCartLineItemId,
  applyCartLineMutationResponse,
} from '../utils/normalizeCart'
import { isValidGuestCartId } from '../utils/guestCartId'
import { coalesceQuantitySync } from '../utils/cartQuantitySync'
import { bumpCartFetchEpoch } from '../utils/cartFetchEpoch'

const logCartSyncError = (message, error, context) => {
  if (import.meta.env.DEV) {
    console.warn(message, context ?? error?.response?.data ?? error)
  }
}

async function ensureAuthCartReady() {
  if (!store.getState().auth.isAuthenticated) return
  try {
    await ensureAuthenticatedCart()
  } catch (error) {
    logCartSyncError('Backend cart ensure failed', error)
  }
}

function findLocalCartItem(itemId) {
  const target = String(itemId ?? '')
  return store.getState().cart.items.find((current) => (
    String(current.id) === target
    || String(current.key) === target
    || String(current.cartItemId ?? '') === target
  ))
}

function syncCartLineMutation(dispatch, itemId, response) {
  const localItem = findLocalCartItem(itemId)
  if (!localItem) return

  const mergedItem = applyCartLineMutationResponse(localItem, response)
  if (mergedItem) {
    dispatch(upsertItem(mergedItem))
  }
}

function reconcileGuestCartResponse(dispatch, response, fallbackItem = null) {
  const guestCartId = extractGuestCartId(response)
  if (isValidGuestCartId(guestCartId)) {
    dispatch(setGuestCartId(guestCartId))
  }

  const items = extractCartItems(response)
  if (items.length > 0) {
    const localItems = store.getState().cart.items
    dispatch(replaceItems(preserveCartDisplayFields(items, [
      ...(fallbackItem ? [fallbackItem] : []),
      ...localItems,
    ])))
    return items
  }

  const apiItem = parseAddToCartResponse(response)
  if (apiItem?.productId) {
    const mergedItem = mergeGuestAddItemWithLocal(apiItem, fallbackItem)
    dispatch(upsertItem(mergedItem))
    return [mergedItem]
  }

  if (fallbackItem?.productId) {
    dispatch(upsertItem(fallbackItem))
    return [fallbackItem]
  }

  return []
}

function findExistingCartLine(items, item) {
  if (!Array.isArray(items) || !item?.productId) return null

  const itemVariantId = String(item.variantId ?? '')
  const itemAttribute = [
    item.attribute?.key ?? item.attribute?.name ?? '',
    item.attribute?.value ?? item.attribute?.option ?? '',
  ].join(':')

  return items.find((current) => {
    if (String(current.productId) !== String(item.productId)) return false
    if (String(current.variantId ?? '') !== itemVariantId) return false
    if (itemVariantId) return true

    const currentAttribute = [
      current.attribute?.key ?? current.attribute?.name ?? '',
      current.attribute?.value ?? current.attribute?.option ?? '',
    ].join(':')
    return currentAttribute === itemAttribute
  }) ?? null
}

function resolveAddedLineQuantity(apiItem, existing, addedItem) {
  const addedQty = Math.max(1, Number(addedItem?.quantity) || 1)
  const existingQty = Math.max(0, Number(existing?.quantity) || 0)
  const apiQty = Number(apiItem?.quantity)
  if (Number.isFinite(apiQty) && apiQty >= existingQty + addedQty) return apiQty
  if (Number.isFinite(apiQty) && apiQty > existingQty) return apiQty
  return existingQty + addedQty
}

function withAddedLineQuantity(mergedItem, apiItem, existing, addedItem) {
  const quantity = resolveAddedLineQuantity(apiItem, existing, addedItem)
  const price = Number(mergedItem?.price)
  return {
    ...mergedItem,
    quantity,
    displaySubtotal: Number.isFinite(price) ? price * quantity : mergedItem?.displaySubtotal,
  }
}

export function useCartActions() {
  const dispatch = useDispatch()
  const items = useSelector(selectCartItems)

  const addToCart = useCallback(async (product, options = {}) => {
    const { silentSuccess = false, ...cartOptions } = options
    const item = buildCartItem(product, cartOptions)
    const currentItems = store.getState().cart.items
    const existing = findExistingCartLine(currentItems, item)
    const isAuthenticated = store.getState().auth.isAuthenticated
    const shouldSyncWithApi = canSyncToApi(item)

    let apiPayload = null
    if (shouldSyncWithApi) {
      try {
        apiPayload = buildAddToCartPayload(item)
      } catch (error) {
        logCartSyncError('Cart API sync skipped — invalid add payload', error)
      }
    }

    // Guest API path: wait for cart create + add-item before touching Redux.
    if (!isAuthenticated && apiPayload) {
      try {
        const currentGuestCartId = store.getState().cart.guestCartId
        if (currentGuestCartId && !isValidGuestCartId(currentGuestCartId)) {
          dispatch(clearGuestCartId())
          await persistor.persist()
        }

        if (import.meta.env.DEV) {
          console.info('[cart] guest add flow', {
            hasGuestCartId: isValidGuestCartId(store.getState().cart.guestCartId),
            guestCartId: store.getState().cart.guestCartId,
            productId: apiPayload.product_id,
          })
        }

        const response = await addGuestProductToCart(apiPayload)
        bumpCartFetchEpoch()
        reconcileGuestCartResponse(dispatch, response, existing ?? item)
        const apiItem = parseAddToCartResponse(response)
        const line = findExistingCartLine(store.getState().cart.items, item) ?? existing
        if (line) {
          const next = withAddedLineQuantity(line, apiItem, existing, item)
          dispatch(upsertItem(next))
        }
        await persistor.persist()
        if (!silentSuccess) {
          notify.success(`${item.name} added to cart`)
        }
        return item
      } catch (error) {
        logCartSyncError('Guest cart sync failed', error, error?.createCartResponse)
        notify.fromError(error, 'Could not add item to cart. Please try again.')
        return null
      }
    }

    // Authenticated API path: wait for POST /cart/add-item before touching Redux.
    if (isAuthenticated && apiPayload) {
      if (import.meta.env.DEV) {
        console.info('[cart] authenticated add flow — using POST /cart/add-item', {
          productId: apiPayload.product_id,
        })
      }

      try {
        await ensureAuthCartReady()
        const response = await addItemToCart(apiPayload)
        const apiItem = parseAddToCartResponse(response)
        if (!apiItem?.productId) {
          throw new Error('Add to cart response missing product')
        }

        const mergedItem = withAddedLineQuantity(
          mergeGuestAddItemWithLocal(apiItem, existing ?? item),
          apiItem,
          existing,
          item,
        )
        bumpCartFetchEpoch()
        dispatch(upsertItem(mergedItem))
        if (!silentSuccess) {
          notify.success(`${item.name} added to cart`)
        }
        return mergedItem
      } catch (error) {
        logCartSyncError('Authenticated cart add failed', error)
        notify.fromError(error, 'Could not add item to cart. Please try again.')
        return null
      }
    }

    // Local-only items (mock ids) with no API sync.
    dispatch(addItem({ product, options: cartOptions }))
    if (!silentSuccess) {
      notify.success(`${item.name} added to cart`)
    }

    if (import.meta.env.DEV && !shouldSyncWithApi) {
      console.warn('Cart API sync skipped — no backend product_id', {
        productId: item.productId,
        syncable: item.syncable,
      })
    }

    return item
  }, [dispatch])

  const updateQuantity = useCallback(async (itemId, quantity) => {
    const isAuthenticated = store.getState().auth.isAuthenticated
    const nextQuantity = Math.max(1, Number(quantity) || 1)
    bumpCartFetchEpoch()
    dispatch(setQuantity({ itemId, quantity: nextQuantity }))
    const item = items.find((current) => current.id === itemId || current.key === itemId)
    const lineItemId = resolveCartLineItemId(item)
    if (!lineItemId) return

    try {
      const response = await coalesceQuantitySync(lineItemId, nextQuantity, async (quantity) => {
        if (isAuthenticated) {
          await ensureAuthCartReady()
          return updateCartItemQuantity(lineItemId, quantity)
        }

        const guestCartId = store.getState().cart.guestCartId
        if (!isValidGuestCartId(guestCartId)) return null

        return updateGuestCartItem(
          lineItemId,
          buildUpdateCartQuantityPayload(quantity),
          guestCartId,
        )
      })

      if (!response) return

      syncCartLineMutation(dispatch, itemId, response)
    } catch (error) {
      logCartSyncError('Cart quantity sync failed after local update', error)
    }
  }, [dispatch, items])

  const deleteItem = useCallback(async (itemId) => {
    const isAuthenticated = store.getState().auth.isAuthenticated
    const item = items.find((current) => current.id === itemId || current.key === itemId)
    const lineItemId = resolveCartLineItemId(item)
    bumpCartFetchEpoch()
    dispatch(removeItem(itemId))
    if (!lineItemId) return

    try {
      if (isAuthenticated) {
        await ensureAuthCartReady()
        await removeCartItem(lineItemId)
        return
      }

      const guestCartId = store.getState().cart.guestCartId
      if (!isValidGuestCartId(guestCartId)) return

      await removeGuestCartItem(lineItemId, guestCartId)
    } catch (error) {
      logCartSyncError('Cart delete sync failed after local remove', error)
    }
  }, [dispatch, items])

  const selectItem = useCallback(async (itemId, selected) => {
    const isAuthenticated = store.getState().auth.isAuthenticated
    dispatch(setSelected({ itemId, selected }))
    const item = items.find((current) => current.id === itemId || current.key === itemId)
    const lineItemId = resolveCartLineItemId(item)
    if (!isAuthenticated || !lineItemId) return

    try {
      await ensureAuthCartReady()
      const response = await updateCartItemSelection(lineItemId, selected)
      syncCartLineMutation(dispatch, itemId, response)
    } catch (error) {
      logCartSyncError('Cart selection sync failed after local update', error)
    }
  }, [dispatch, items])

  const clearAll = useCallback(async () => {
    const isAuthenticated = store.getState().auth.isAuthenticated
    const lineItemIds = items
      .map((item) => resolveCartLineItemId(item))
      .filter(Boolean)

    if (isAuthenticated) {
      await ensureAuthCartReady()
      await Promise.allSettled(
        lineItemIds.map((lineItemId) => removeCartItem(lineItemId).catch((error) => {
          logCartSyncError('Cart clear sync failed for item', error)
        })),
      )
    } else {
      const guestCartId = store.getState().cart.guestCartId
      if (isValidGuestCartId(guestCartId)) {
        await Promise.allSettled(
          lineItemIds.map((lineItemId) => removeGuestCartItem(lineItemId, guestCartId).catch((error) => {
            logCartSyncError('Guest cart clear sync failed for item', error)
          })),
        )
      }
    }

    dispatch(clearCart())
    bumpCartFetchEpoch()
    if (!isAuthenticated) {
      dispatch(clearGuestCartId())
      await persistor.persist()
    }
  }, [dispatch, items])

  const saveItem = useCallback((itemId) => {
    bumpCartFetchEpoch()
    dispatch(saveForLater(itemId))
  }, [dispatch])

  const restoreSavedItem = useCallback((itemId) => {
    const item = store.getState().cart.savedItems.find(
      (current) => current.id === itemId || current.key === itemId,
    )
    if (!item) return

    dispatch(moveSavedToCart(itemId))
    notify.success(`${item.name} added to cart`)
  }, [dispatch])

  const deleteSaved = useCallback((itemId) => {
    dispatch(removeSavedItem(itemId))
  }, [dispatch])

  const clearSaved = useCallback(() => {
    dispatch(clearSavedItems())
  }, [dispatch])

  const removeCheckedOutItems = useCallback((lineIds) => {
    const idSet = new Set(
      (Array.isArray(lineIds) ? lineIds : [])
        .map((id) => String(id ?? '').trim())
        .filter(Boolean),
    )
    if (idSet.size === 0) return

    bumpCartFetchEpoch()
    store.getState().cart.items.forEach((item) => {
      const lineId = resolveCartLineItemId(item)
      if (lineId && idSet.has(lineId)) {
        dispatch(removeItem(item.id))
      }
    })
  }, [dispatch])

  const ensureBackendCart = useCallback(async () => {
    if (!store.getState().auth.isAuthenticated) return null
    try {
      return await ensureAuthenticatedCart()
    } catch {
      return null
    }
  }, [])

  return {
    addToCart,
    updateQuantity,
    deleteItem,
    selectItem,
    clearAll,
    removeCheckedOutItems,
    saveItem,
    restoreSavedItem,
    deleteSaved,
    clearSaved,
    ensureBackendCart,
  }
}
