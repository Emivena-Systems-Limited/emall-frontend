import { Navigate } from 'react-router'
import { useSelector } from 'react-redux'
import { BUY_NOW_CHECKOUT_PATH, isBuyNowAuthPending } from '../utils/buyNowItem'

export default function GuestOnlyRoute({ children, redirectTo = '/' }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to={isBuyNowAuthPending() ? BUY_NOW_CHECKOUT_PATH : redirectTo} replace />
  }

  return children
}
