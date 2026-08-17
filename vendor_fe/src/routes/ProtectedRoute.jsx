import { Navigate } from 'react-router'
import { useSelector } from 'react-redux'
import { isVendorVerified } from '../utils/vendorAuth'
import { useVendorMetricsBootstrap } from '../hooks/useVendorMetricsBootstrap'

export default function ProtectedRoute({ children, redirectTo = '/login' }) {
  const { isAuthenticated, user, pendingVerificationEmail } = useSelector((state) => state.auth)
  useVendorMetricsBootstrap({ enabled: isAuthenticated })

  if (!isAuthenticated) {
    if (pendingVerificationEmail || (user && !isVendorVerified(user))) {
      return <Navigate to="/verify-account" replace />
    }
    return <Navigate to={redirectTo} replace />
  }

  return children
}
