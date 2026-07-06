import { Navigate, useLocation } from 'react-router'
import { useSelector } from 'react-redux'

/**
 * @param {boolean} viaLogin - When true, guests are routed to /login (carrying
 * the current path as `state.from`) instead of the home page, so they land
 * back where they started right after verification.
 */
export default function ProtectedRoute({ children, redirectTo = '/', viaLogin = false }) {
  const location = useLocation()
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)

  if (!isAuthenticated) {
    if (viaLogin) {
      return <Navigate to="/login" state={{ from: location.pathname }} replace />
    }
    return <Navigate to={redirectTo} replace />
  }

  return children
}
