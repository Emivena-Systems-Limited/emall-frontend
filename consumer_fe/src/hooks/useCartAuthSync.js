import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { queryClient } from '../lib/queryClient'
import { store } from '../store/store'
import { AUTHENTICATED_CART_QUERY_KEY } from '../constants/cart'
import { mergeGuestCartIntoAccount, syncGuestCartForAuthenticatedUser } from '../services/cartService'
import {
  cartSyncFailed,
  cartSyncStarted,
  cartSyncSucceeded,
  selectCartItems,
  selectGuestCartId,
  selectCartSyncedUserId,
} from '../store/slices/cartSlice'
import { buildMergeCartItems, extractCartItems } from '../utils/normalizeCart'
import { isValidGuestCartId } from '../utils/guestCartId'
import { invalidateCartCompositionQueries } from '../utils/cartQueryInvalidation'
import { notify } from '../lib/notify'

/**
 * Fires exactly once per login/signup: if a guest_cart_id exists, hands it off
 * via GET /api/cart/guest (Guest-Cart-Id + Application-Token). Otherwise
 * falls back to POST /cart/merge with locally tracked guest lines.
 */
export function useCartAuthSync() {
  const dispatch = useDispatch()
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const userId = useSelector((state) => state.auth.user?.id)
  const syncedUserId = useSelector(selectCartSyncedUserId)
  const inFlightUserIdRef = useRef(null)

  useEffect(() => {
    if (!isAuthenticated || !userId) return
    if (syncedUserId === userId) return
    if (inFlightUserIdRef.current === userId) return

    inFlightUserIdRef.current = userId
    const state = store.getState()
    const guestCartId = selectGuestCartId(state)
    const guestItems = buildMergeCartItems(selectCartItems(state))

    dispatch(cartSyncStarted())

    const syncPromise = isValidGuestCartId(guestCartId)
      ? syncGuestCartForAuthenticatedUser()
      : mergeGuestCartIntoAccount(guestItems)

    syncPromise
      .then((payload) => {
        const mergedItems = extractCartItems(payload)
        dispatch(cartSyncSucceeded({ items: mergedItems, userId }))
        queryClient.setQueryData(AUTHENTICATED_CART_QUERY_KEY, mergedItems)
        invalidateCartCompositionQueries()

        if (guestCartId || guestItems.length > 0) {
          notify.success('Your cart has been synced to your account')
        }
      })
      .catch((error) => {
        dispatch(cartSyncFailed(error?.message ?? 'Cart sync failed'))
        if (import.meta.env.DEV) {
          console.warn('Guest cart merge failed', error?.response?.data ?? error)
        }
      })
      .finally(() => {
        if (inFlightUserIdRef.current === userId) {
          inFlightUserIdRef.current = null
        }
      })
  }, [dispatch, isAuthenticated, userId, syncedUserId])
}
