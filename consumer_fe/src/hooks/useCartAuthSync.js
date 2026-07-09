import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { queryClient } from '../lib/queryClient'
import { store } from '../store/store'
import { AUTHENTICATED_CART_QUERY_KEY } from '../constants/cart'
import { syncGuestCartForAuthenticatedUser, ensureAuthenticatedCart } from '../services/cartService'
import {
  cartSyncFailed,
  cartSyncStarted,
  cartSyncSucceeded,
  selectCartItems,
  selectGuestCartId,
  selectCartSyncedUserId,
} from '../store/slices/cartSlice'
import { extractCartItems, extractCartSummary } from '../utils/normalizeCart'
import { normalizeCartSummary } from '../utils/checkoutTotals'
import { isValidGuestCartId } from '../utils/guestCartId'
import { sameCartUserId } from '../utils/cartUserId'
import { notify } from '../lib/notify'

let authCartSyncInFlightUserId = null

/**
 * Fires once per login/signup. When a guest_cart_id exists, hands it off via
 * GET /api/cart/guest. Otherwise loads cart items via GET /api/cart/items.
 */
export function useCartAuthSync() {
  const dispatch = useDispatch()
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const userId = useSelector((state) => state.auth.user?.id)
  const syncedUserId = useSelector(selectCartSyncedUserId)

  useEffect(() => {
    if (!isAuthenticated || !userId) return
    if (sameCartUserId(syncedUserId, userId)) return
    if (authCartSyncInFlightUserId === userId) return

    authCartSyncInFlightUserId = userId
    const state = store.getState()
    const guestCartId = selectGuestCartId(state)
    const localItems = selectCartItems(state)
    const hadLocalItems = localItems.length > 0

    dispatch(cartSyncStarted())

    if (!isValidGuestCartId(guestCartId)) {
      ensureAuthenticatedCart()
        .then((payload) => {
          const syncedItems = extractCartItems(payload)
          const items = syncedItems.length > 0 ? syncedItems : localItems
          dispatch(cartSyncSucceeded({ items, userId }))
          queryClient.setQueryData(
            [...AUTHENTICATED_CART_QUERY_KEY, userId],
            { items, summary: normalizeCartSummary(extractCartSummary(payload)) },
          )
        })
        .catch((error) => {
          dispatch(cartSyncFailed(error?.message ?? 'Cart sync failed'))
          if (import.meta.env.DEV) {
            console.warn('Cart ensure after login failed', error?.response?.data ?? error)
          }
        })
        .finally(() => {
          authCartSyncInFlightUserId = null
        })
      return
    }

    syncGuestCartForAuthenticatedUser()
      .then(async (payload) => {
        const syncedItems = extractCartItems(payload)
        try {
          await ensureAuthenticatedCart()
        } catch (error) {
          if (import.meta.env.DEV) {
            console.warn('Cart ensure after login failed', error?.response?.data ?? error)
          }
        }
        dispatch(cartSyncSucceeded({ items: syncedItems, userId }))
        queryClient.setQueryData(
          [...AUTHENTICATED_CART_QUERY_KEY, userId],
          {
            items: syncedItems,
            summary: normalizeCartSummary(extractCartSummary(payload)),
          },
        )

        if (hadLocalItems) {
          notify.success('Your cart has been synced to your account')
        }
      })
      .catch((error) => {
        dispatch(cartSyncFailed(error?.message ?? 'Cart sync failed'))
        if (import.meta.env.DEV) {
          console.warn('Cart sync after login failed', error?.response?.data ?? error)
        }
      })
      .finally(() => {
        if (authCartSyncInFlightUserId === userId) {
          authCartSyncInFlightUserId = null
        }
      })
  }, [dispatch, isAuthenticated, userId, syncedUserId])
}
