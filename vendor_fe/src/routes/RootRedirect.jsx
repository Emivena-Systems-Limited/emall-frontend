import { Navigate } from 'react-router'
import { useSelector } from 'react-redux'

export default function RootRedirect() {
  const { isAuthenticated, pendingVerificationEmail } = useSelector((state) => state.auth)

  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  if (pendingVerificationEmail) return <Navigate to="/verify-account" replace />

  return <Navigate to="/login" replace />
}
