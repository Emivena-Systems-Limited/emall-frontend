import { Navigate, useLocation } from 'react-router'
import { isValidAuthOtpSession, readAuthOtpSession } from '../utils/authOtpSession'

export default function AuthVerifyRoute({ children, redirectTo = '/' }) {
  const location = useLocation()
  const session = location.state ?? readAuthOtpSession()

  if (!isValidAuthOtpSession(session)) {
    return <Navigate to={redirectTo} replace />
  }

  return children
}
