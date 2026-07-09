import { useQuery } from '@tanstack/react-query'
import { useDispatch, useSelector } from 'react-redux'
import { GUEST_CART_QUERY_KEY } from '../constants/cart'
import { getGuestCart } from '../services/cartService'
import { persistor, store } from '../store/store'
import { replaceItems, selectGuestCartId, setGuestCartId } from '../store/slices/cartSlice'
import { extractCartItems, extractCartSummary } from '../utils/normalizeCart'
import { normalizeCartSummary } from '../utils/checkoutTotals'
import { isValidGuestCartId } from '../utils/guestCartId'

/** Loads a guest cart from GET /api/cart/guest and syncs it into Redux. */
export async function syncGuestCart(dispatch) {
  const guestCartId = String(selectGuestCartId(store.getState()) ?? '').trim()
  if (!isValidGuestCartId(guestCartId)) {
    return { items: [], summary: null }
  }

  const payload = await getGuestCart(guestCartId)
  const items = extractCartItems(payload)
  const summary = normalizeCartSummary(extractCartSummary(payload))

  dispatch(setGuestCartId(guestCartId))
  dispatch(replaceItems(items))
  await persistor.persist()

  return { items, summary }
}

export function useGuestCart(options = {}) {
  const {
    enabled = true,
    refetchOnMount = false,
    staleTime = Infinity,
  } = options
  const dispatch = useDispatch()
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const guestCartId = useSelector(selectGuestCartId)

  return useQuery({
    queryKey: [...GUEST_CART_QUERY_KEY, guestCartId],
    queryFn: () => syncGuestCart(dispatch),
    enabled: enabled && !isAuthenticated && isValidGuestCartId(guestCartId),
    staleTime,
    retry: 1,
    refetchOnMount,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}
