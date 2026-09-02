import { Navigate } from 'react-router'
import { useSelector } from 'react-redux'

export default function ProtectedRoute({ children, redirectTo = '/login' }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  return children
}
