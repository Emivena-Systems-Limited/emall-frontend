import { useQuery } from '@tanstack/react-query'
import { useDispatch, useSelector } from 'react-redux'
import { GUEST_CART_QUERY_KEY } from '../constants/cart'
import { getGuestCart } from '../services/cartService'
import { persistor, store } from '../store/store'
import { replaceItems, selectGuestCartId, setGuestCartId } from '../store/slices/cartSlice'
import { extractCartItems, extractCartSummary } from '../utils/normalizeCart'
import { isValidGuestCartId } from '../utils/guestCartId'

/** Loads a guest cart from GET /api/cart/guest and syncs it into Redux. */
export async function syncGuestCart(dispatch) {
  const guestCartId = String(selectGuestCartId(store.getState()) ?? '').trim()
  if (!isValidGuestCartId(guestCartId)) {
    return { items: [], summary: null }
  }

  const payload = await getGuestCart(guestCartId)

  // GET /api/cart/guest does not echo guest_cart_id — keep the persisted header value.
  if (guestCartId) {
    dispatch(setGuestCartId(guestCartId))
  }

  const items = extractCartItems(payload)
  if (items.length > 0) {
    dispatch(replaceItems(items))
  }

  if (guestCartId) {
    await persistor.persist()
  }

  return { items, summary: extractCartSummary(payload) }
}

export function useGuestCart(options = {}) {
  const { enabled = true } = options
  const dispatch = useDispatch()
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const guestCartId = useSelector(selectGuestCartId)

  return useQuery({
    queryKey: [...GUEST_CART_QUERY_KEY, guestCartId],
    queryFn: () => syncGuestCart(dispatch),
    enabled: enabled && !isAuthenticated && isValidGuestCartId(guestCartId),
    staleTime: 30_000,
    retry: 1,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}
