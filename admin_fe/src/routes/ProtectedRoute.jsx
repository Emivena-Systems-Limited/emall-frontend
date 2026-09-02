import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useSelector } from 'react-redux'
import { rememberAppPath } from '../utils/authRedirect'

export default function ProtectedRoute({ children, redirectTo = '/login' }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const location = useLocation()

  useEffect(() => {
    if (isAuthenticated) rememberAppPath(location)
  }, [isAuthenticated, location])

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />
  }

  return children
}
