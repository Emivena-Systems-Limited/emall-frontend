import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getAuthenticatedCart } from '../services/cartService'
import { mergeItems } from '../store/slices/cartSlice'
import { extractCartItems } from '../utils/normalizeCart'

let bootstrappedAccessToken = null

export function useCartBootstrap() {
  const dispatch = useDispatch()
  const { accessToken, isAuthenticated } = useSelector((state) => state.auth)

  useEffect(() => {
    let cancelled = false

    async function loadCart() {
      if (!isAuthenticated || !accessToken) {
        bootstrappedAccessToken = null
        return
      }

      if (bootstrappedAccessToken === accessToken) return
      bootstrappedAccessToken = accessToken

      try {
        const cart = await getAuthenticatedCart()
        if (!cancelled) {
          dispatch(mergeItems(extractCartItems(cart)))
        }
      } catch {
        bootstrappedAccessToken = null
        // Keep the persisted/local cart when the backend cart is unavailable.
      }
    }

    loadCart()

    return () => {
      cancelled = true
    }
  }, [accessToken, dispatch, isAuthenticated])
}
