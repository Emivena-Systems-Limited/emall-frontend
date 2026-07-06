import { useSelector } from 'react-redux'
import { useAuthenticatedCart } from './useAuthenticatedCart'
import { useCartAuthSync } from './useCartAuthSync'
import { useGuestCart } from './useGuestCart'
import { selectCartSyncStatus } from '../store/slices/cartSlice'

/**
 * Mounted once at the app shell (SiteLayout) so it covers every page:
 * 1. useCartAuthSync — one-time guest→account handoff on login/signup.
 * 2. useGuestCart — restore guest cart from GET /api/cart/guest when a
 *    persisted guest_cart_id exists.
 * 3. useAuthenticatedCart — routine GET /cart refresh for logged-in users.
 */
export function useCartBootstrap() {
  useCartAuthSync()
  const syncStatus = useSelector(selectCartSyncStatus)
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const cartSyncReady = syncStatus !== 'syncing'

  useGuestCart({ enabled: !isAuthenticated && cartSyncReady })
  useAuthenticatedCart({ strategy: 'merge', enabled: isAuthenticated && cartSyncReady })
}
