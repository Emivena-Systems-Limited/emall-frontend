import { useMemo } from 'react'
import { useLocation } from 'react-router'
import { AUTH_FLOW } from '../constants/auth'
import {
  isValidAuthOtpSession,
  readAuthOtpSession,
  saveAuthOtpSession,
} from '../utils/authOtpSession'

export function useAuthOtpSession() {
  const location = useLocation()

  return useMemo(() => {
    if (isValidAuthOtpSession(location.state)) {
      saveAuthOtpSession(location.state)
      return location.state
    }

    const storedSession = readAuthOtpSession()
    if (storedSession) return storedSession

    return null
  }, [location.state])
}

export function useAuthOtpFlow(session) {
  const location = useLocation()
  const isRegisterFlow = location.pathname.startsWith('/register')

  return session?.flow ?? (isRegisterFlow ? AUTH_FLOW.REGISTER : AUTH_FLOW.LOGIN)
}
