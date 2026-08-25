import { useQuery } from '@tanstack/react-query'
import { useDispatch, useSelector } from 'react-redux'
import { AUTHENTICATED_CART_QUERY_KEY } from '../constants/cart'
import { getAuthenticatedCart } from '../services/cartService'
import { store } from '../store/store'
import { mergeItems, replaceItems } from '../store/slices/cartSlice'
import { extractCartItems, extractCartSummary } from '../utils/normalizeCart'
import { normalizeCartSummary } from '../utils/checkoutTotals'
import { getCartFetchEpoch, isCurrentCartFetchEpoch } from '../utils/cartFetchEpoch'

/**
 * Loads the logged-in user's cart from GET /api/cart/items and syncs it into Redux.
 * @param {'merge' | 'replace'} strategy - merge keeps unsynced local lines; replace uses server as source of truth
 */
export async function syncAuthenticatedCart(dispatch, strategy = 'replace') {
  const epoch = getCartFetchEpoch()
  const payload = await getAuthenticatedCart()
  const summary = normalizeCartSummary(extractCartSummary(payload))

  if (!isCurrentCartFetchEpoch(epoch)) {
    return { items: store.getState().cart.items, summary, ignored: true }
  }

  const items = extractCartItems(payload)

  if (strategy === 'replace') {
    dispatch(replaceItems(items))
  } else {
    dispatch(mergeItems(items))
  }

  return { items, summary }
}

export function useAuthenticatedCart(options = {}) {
  const {
    enabled = true,
    strategy = 'replace',
    refetchOnMount = false,
    staleTime = Infinity,
  } = options
  const dispatch = useDispatch()
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const userId = useSelector((state) => state.auth.user?.id)

  return useQuery({
    queryKey: [...AUTHENTICATED_CART_QUERY_KEY, userId],
    queryFn: () => syncAuthenticatedCart(dispatch, strategy),
    enabled: enabled && isAuthenticated,
    staleTime,
    retry: 1,
    refetchOnMount,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}
