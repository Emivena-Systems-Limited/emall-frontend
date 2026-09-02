import axios from 'axios'
import config from '../utils/Config'
import { AUTH_ENDPOINTS } from '../constants/auth'
import { logout } from '../store/slices/authSlice'
import { persistor, store } from '../store/store'
import notify from './notify'

const apiClient = axios.create({
  baseURL: config.base_url,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 20000,
})

function requestUrl(requestConfig) {
  return String(requestConfig?.url ?? '')
}

const GUEST_AUTH_PATHS = [
  AUTH_ENDPOINTS.LOGIN,
  AUTH_ENDPOINTS.SEND_RESET_PASSWORD_OTP,
  AUTH_ENDPOINTS.RESET_PASSWORD,
]

function shouldSkipAuthLogout(requestConfig) {
  if (requestConfig?.skipAuthLogout) return true
  const url = requestUrl(requestConfig)
  return Object.values(AUTH_ENDPOINTS).some((path) => url.includes(path))
}

function isGuestAuthRequest(url) {
  return GUEST_AUTH_PATHS.some((path) => url.includes(path))
}

function clearAuthenticatedSession() {
  if (!store.getState().auth.isAuthenticated) return
  store.dispatch(logout())
  persistor.persist()
  notify.warning('Your session has expired. Please sign in again.')
}

apiClient.interceptors.request.use((requestConfig) => {
  const { accessToken, applicationToken, user } = store.getState().auth
  const guestAuth = isGuestAuthRequest(requestUrl(requestConfig))
  const resolvedApplicationToken =
    applicationToken
    ?? user?.application_token
    ?? user?.applicationToken
    ?? null

  if (accessToken && !guestAuth) {
    requestConfig.headers.Authorization = `Bearer ${accessToken}`
  }

  if (resolvedApplicationToken && !guestAuth) {
    requestConfig.headers['Application-Token'] = resolvedApplicationToken
  }

  if (requestConfig.data instanceof FormData) {
    delete requestConfig.headers['Content-Type']
  }

  return requestConfig
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error?.response?.status === 401
      && !shouldSkipAuthLogout(error.config)
      && store.getState().auth.isAuthenticated
    ) {
      clearAuthenticatedSession()
    }

    return Promise.reject(error)
  },
)

export default apiClient
