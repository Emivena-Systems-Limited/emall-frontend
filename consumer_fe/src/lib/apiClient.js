import axios from 'axios'
import { logout } from '../store/slices/authSlice'
import { persistor, store } from '../store/store'
import { isValidGuestCartId } from '../utils/guestCartId'
import {
  runSessionLogoutOnce,
  shouldForceLogoutOn401,
} from './sessionAuth'

const apiClient = axios.create({
  baseURL: import.meta.env.API_BASE_URL ?? '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

function clearAuthenticatedSession() {
  runSessionLogoutOnce({
    dispatchLogout: () => store.dispatch(logout()),
    persistAuth: () => persistor.persist(),
  })
}

apiClient.interceptors.request.use((config) => {
  const { accessToken, applicationToken, user, isAuthenticated } = store.getState().auth
  const guestCartId = store.getState().cart?.guestCartId ?? null
  const resolvedApplicationToken =
    applicationToken ?? user?.application_token ?? user?.applicationToken ?? null
  const guestSessionOnly = config.guestSessionOnly === true

  if (!guestSessionOnly && isAuthenticated) {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    if (resolvedApplicationToken) {
      config.headers['Application-Token'] = resolvedApplicationToken
    }
  }

  const shouldAttachGuestCartHeader =
    !config.skipGuestCartHeader && isValidGuestCartId(guestCartId)

  if (shouldAttachGuestCartHeader) {
    config.headers['Guest-Cart-Id'] = String(guestCartId).trim()
  }

  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      shouldForceLogoutOn401(error, error.config) &&
      store.getState().auth.isAuthenticated
    ) {
      clearAuthenticatedSession()
    }

    return Promise.reject(error)
  },
)

export default apiClient
