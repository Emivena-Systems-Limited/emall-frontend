import { Navigate, Outlet, useLocation } from 'react-router'
import { useSelector } from 'react-redux'
import { DEFAULT_POST_LOGIN_PATH } from '../constants/auth'
import { getPostAuthRedirect } from '../utils/authRedirect'

export default function GuestOnlyRoute({ redirectTo = DEFAULT_POST_LOGIN_PATH }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const location = useLocation()

  if (isAuthenticated) {
    return <Navigate to={getPostAuthRedirect(location.state?.from, redirectTo)} replace />
  }

  return <Outlet />
}
