import { useQuery } from '@tanstack/react-query'
import { useDispatch, useSelector } from 'react-redux'
import { AUTHENTICATED_CART_QUERY_KEY } from '../constants/cart'
import { getAuthenticatedCart } from '../services/cartService'
import { mergeItems, replaceItems } from '../store/slices/cartSlice'
import { extractCartItems } from '../utils/normalizeCart'

/**
 * Loads the logged-in user's cart from GET /api/cart and syncs it into Redux.
 * @param {'merge' | 'replace'} strategy - merge keeps unsynced local lines; replace uses server as source of truth
 */
export async function syncAuthenticatedCart(dispatch, strategy = 'merge') {
  const payload = await getAuthenticatedCart()
  const items = extractCartItems(payload)

  if (strategy === 'replace') {
    dispatch(replaceItems(items))
  } else {
    dispatch(mergeItems(items))
  }

  return items
}

export function useAuthenticatedCart(options = {}) {
  const {
    enabled = true,
    strategy = 'merge',
    refetchOnMount = false,
  } = options
  const dispatch = useDispatch()
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)

  return useQuery({
    queryKey: AUTHENTICATED_CART_QUERY_KEY,
    queryFn: () => syncAuthenticatedCart(dispatch, strategy),
    enabled: enabled && isAuthenticated,
    staleTime: 30_000,
    retry: 1,
    refetchOnMount,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}
