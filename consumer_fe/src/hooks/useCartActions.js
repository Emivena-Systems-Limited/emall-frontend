import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { notify } from '../lib/notify'
import {
  addItem,
  buildCartItem,
  clearCart,
  clearSavedItems,
  moveSavedToCart,
  removeItem,
  removeSavedItem,
  saveForLater,
  selectCartItems,
  setQuantity,
  setSelected,
  upsertItem,
} from '../store/slices/cartSlice'
import {
  addItemToCart,
  createCart,
  removeCartItem,
  updateCartItem,
} from '../services/cartService'
import { buildAddToCartPayload, normalizeCartItem } from '../utils/normalizeCart'

const shouldSyncItem = (item) => Boolean(item?.syncable && item?.productId)

const logCartSyncError = (message, error) => {
  if (import.meta.env.DEV) {
    console.warn(message, error?.response?.data ?? error)
  }
}

export function useCartActions() {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((state) => state.auth)
  const items = useSelector(selectCartItems)

  const addToCart = useCallback(async (product, options = {}) => {
    const item = buildCartItem(product, options)
    dispatch(addItem({ product, options }))
    notify.success(`${item.name} added to cart`)

    if (!isAuthenticated || !shouldSyncItem(item)) return item

    try {
      try {
        await createCart()
      } catch (error) {
        logCartSyncError('Backend cart ensure failed before add', error)
      }
      const response = await addItemToCart(buildAddToCartPayload(item))
      const apiItem = normalizeCartItem(response?.item ?? response?.cart_item ?? response)
      if (apiItem?.productId) {
        dispatch(upsertItem(apiItem))
        return apiItem
      }
      return item
    } catch (error) {
      logCartSyncError('Cart sync failed after local add', error)
      return item
    }
  }, [dispatch, isAuthenticated])

  const updateQuantity = useCallback(async (itemId, quantity) => {
    dispatch(setQuantity({ itemId, quantity }))
    const item = items.find((current) => current.id === itemId || current.key === itemId)
    if (!isAuthenticated || !item?.cartItemId || !shouldSyncItem(item)) return

    try {
      await updateCartItem(item.cartItemId, { quantity })
    } catch (error) {
      logCartSyncError('Cart quantity sync failed after local update', error)
    }
  }, [dispatch, isAuthenticated, items])

  const deleteItem = useCallback(async (itemId) => {
    const item = items.find((current) => current.id === itemId || current.key === itemId)
    dispatch(removeItem(itemId))
    if (!isAuthenticated || !item?.cartItemId || !shouldSyncItem(item)) return

    try {
      await removeCartItem(item.cartItemId)
    } catch (error) {
      logCartSyncError('Cart delete sync failed after local remove', error)
    }
  }, [dispatch, isAuthenticated, items])

  const selectItem = useCallback((itemId, selected) => {
    dispatch(setSelected({ itemId, selected }))
  }, [dispatch])

  const clearAll = useCallback(() => {
    dispatch(clearCart())
  }, [dispatch])

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
    if (!isAuthenticated) return null
    try {
      return await createCart()
    } catch {
      return null
    }
  }, [isAuthenticated])

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
