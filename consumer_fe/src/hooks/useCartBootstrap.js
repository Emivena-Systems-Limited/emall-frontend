import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useCartAuthSync } from './useCartAuthSync'
import { resetAuthenticatedCartSession } from '../services/cartService'

/**
 * Mounted once in App so cart hooks do not remount on every page navigation:
 * 1. useCartAuthSync — one-time guest→account handoff on login/signup.
 *
 * Cart refresh runs on CartPage via useAuthenticatedCart / useGuestCart.
 */
export function useCartBootstrap() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const userId = useSelector((state) => state.auth.user?.id)
  const trackedUserIdRef = useRef(null)

  useEffect(() => {
    if (!isAuthenticated) {
      trackedUserIdRef.current = null
      resetAuthenticatedCartSession()
      return
    }

    if (!userId) return

    if (trackedUserIdRef.current !== userId) {
      trackedUserIdRef.current = userId
      resetAuthenticatedCartSession()
    }
  }, [isAuthenticated, userId])

  useCartAuthSync()
}
