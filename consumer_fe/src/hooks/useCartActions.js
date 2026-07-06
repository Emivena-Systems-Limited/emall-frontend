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
  createCart,
  removeCartItem,
  updateCartItem,
  updateCartItemSelection,
} from '../services/cartService'
import { persistor, store } from '../store/store'
import {
  invalidateCartCompositionQueries,
  invalidateCartTotalsQueries,
} from '../utils/cartQueryInvalidation'
import {
  buildAddToCartPayload,
  buildUpdateCartQuantityPayload,
  canSyncToApi,
  extractCartItems,
  extractGuestCartId,
  mergeGuestAddItemWithLocal,
  normalizeCartItem,
  parseAddToCartResponse,
  resolveCartLineItemId,
} from '../utils/normalizeCart'
import { isValidGuestCartId } from '../utils/guestCartId'

const logCartSyncError = (message, error, context) => {
  if (import.meta.env.DEV) {
    console.warn(message, context ?? error?.response?.data ?? error)
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
        invalidateCartCompositionQueries()
        notify.success(`${item.name} added to cart`)
        return item
      } catch (error) {
        logCartSyncError('Guest cart sync failed', error, error?.createCartResponse)
        notify.fromError(error, 'Could not add item to cart. Please try again.')
        return item
      }
    }

    // Local-only guest items (mock ids) or authenticated optimistic add.
    dispatch(addItem({ product, options }))
    notify.success(`${item.name} added to cart`)

    if (!shouldSyncWithApi || !apiPayload) {
      if (import.meta.env.DEV && !shouldSyncWithApi) {
        console.warn('Cart API sync skipped — no backend product_id', {
          productId: item.productId,
          syncable: item.syncable,
        })
      }
      return item
    }

    if (import.meta.env.DEV) {
      console.info('[cart] authenticated add flow — using POST /cart/items', {
        productId: apiPayload.product_id,
      })
    }

    try {
      try {
        await createCart()
      } catch (error) {
        logCartSyncError('Backend cart ensure failed before add', error)
      }

      const response = await addItemToCart(apiPayload)
      const apiItem = parseAddToCartResponse(response)
      if (apiItem?.productId) {
        dispatch(upsertItem(apiItem))
        invalidateCartCompositionQueries()
        return apiItem
      }

      invalidateCartCompositionQueries()
      return item
    } catch (error) {
      logCartSyncError('Cart sync failed after local add', error)
      return item
    }
  }, [dispatch])

  const updateQuantity = useCallback(async (itemId, quantity) => {
    const isAuthenticated = store.getState().auth.isAuthenticated
    const nextQuantity = Math.max(1, Number(quantity) || 1)
    dispatch(setQuantity({ itemId, quantity: nextQuantity }))
    const item = items.find((current) => current.id === itemId || current.key === itemId)
    const lineItemId = resolveCartLineItemId(item)
    if (!isAuthenticated || !lineItemId) return

    try {
      const response = await updateCartItem(lineItemId, buildUpdateCartQuantityPayload(nextQuantity))
      const apiItem = normalizeCartItem(response?.item ?? response?.cart_item ?? response)
      if (apiItem?.cartItemId || apiItem?.productId) {
        dispatch(upsertItem(apiItem))
      }
      invalidateCartTotalsQueries()
    } catch (error) {
      logCartSyncError('Cart quantity sync failed after local update', error)
    }
  }, [dispatch, items])

  const deleteItem = useCallback(async (itemId) => {
    const isAuthenticated = store.getState().auth.isAuthenticated
    const item = items.find((current) => current.id === itemId || current.key === itemId)
    const lineItemId = resolveCartLineItemId(item)
    dispatch(removeItem(itemId))
    if (!isAuthenticated || !lineItemId) return

    try {
      await removeCartItem(lineItemId)
      invalidateCartCompositionQueries()
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
      const response = await updateCartItemSelection(lineItemId, selected)
      const apiItem = normalizeCartItem(response?.item ?? response?.cart_item ?? response)
      if (apiItem?.cartItemId || apiItem?.productId) {
        dispatch(upsertItem(apiItem))
      }
      invalidateCartTotalsQueries()
    } catch (error) {
      logCartSyncError('Cart selection sync failed after local update', error)
    }
  }, [dispatch, items])

  const clearAll = useCallback(async () => {
    const isAuthenticated = store.getState().auth.isAuthenticated
    if (isAuthenticated) {
      const lineItemIds = items
        .map((item) => resolveCartLineItemId(item))
        .filter(Boolean)
      await Promise.allSettled(
        lineItemIds.map((lineItemId) => removeCartItem(lineItemId).catch((error) => {
          logCartSyncError('Cart clear sync failed for item', error)
        })),
      )
    }
    dispatch(clearCart())
    if (!isAuthenticated) {
      dispatch(clearGuestCartId())
      await persistor.persist()
    }
    if (isAuthenticated) invalidateCartCompositionQueries()
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
      return await createCart()
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
