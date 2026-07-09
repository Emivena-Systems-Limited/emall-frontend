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
  return store.getState().cart.items.find(
    (current) => current.id === itemId || current.key === itemId,
  )
}

function syncCartLineMutation(dispatch, itemId, response) {
  const mergedItem = applyCartLineMutationResponse(findLocalCartItem(itemId), response)
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
    dispatch(replaceItems(items))
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

export function useCartActions() {
  const dispatch = useDispatch()
  const items = useSelector(selectCartItems)

  const addToCart = useCallback(async (product, options = {}) => {
    const item = buildCartItem(product, options)
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
        reconcileGuestCartResponse(dispatch, response, item)
        await persistor.persist()
        notify.success(`${item.name} added to cart`)
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

        const mergedItem = mergeGuestAddItemWithLocal(apiItem, item)
        dispatch(upsertItem(mergedItem))
        notify.success(`${item.name} added to cart`)
        return mergedItem
      } catch (error) {
        logCartSyncError('Authenticated cart add failed', error)
        notify.fromError(error, 'Could not add item to cart. Please try again.')
        return null
      }
    }

    // Local-only items (mock ids) with no API sync.
    dispatch(addItem({ product, options }))
    notify.success(`${item.name} added to cart`)

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
    if (!isAuthenticated) {
      dispatch(clearGuestCartId())
      await persistor.persist()
    }
  }, [dispatch, items])

  const saveItem = useCallback((itemId) => {
    dispatch(saveForLater(itemId))
  }, [dispatch])

  const restoreSavedItem = useCallback((itemId) => {
    dispatch(moveSavedToCart(itemId))
  }, [dispatch])

  const deleteSaved = useCallback((itemId) => {
    dispatch(removeSavedItem(itemId))
  }, [dispatch])

  const clearSaved = useCallback(() => {
    dispatch(clearSavedItems())
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
    saveItem,
    restoreSavedItem,
    deleteSaved,
    clearSaved,
    ensureBackendCart,
  }
}
