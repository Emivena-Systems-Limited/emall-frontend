import axios from 'axios'
import config from '../utils/Config'
import { logout } from '../store/slices/authSlice'
import { persistor, store } from '../store/store'
import notify from './notify'
import {
  isAccessTokenExpired,
  runSessionLogoutOnce,
  shouldForceLogoutOn401,
  shouldSkipAuthLogout,
} from './sessionAuth'

const apiClient = axios.create({
  baseURL: config.base_url,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

function clearAuthenticatedSession() {
  runSessionLogoutOnce({
    dispatchLogout: () => store.dispatch(logout()),
    persistAuth: () => persistor.persist(),
    notifyExpired: () => {
      notify.warning('Your session has expired. Please sign in again.')
    },
  })
}

apiClient.interceptors.request.use((requestConfig) => {
  const { accessToken, applicationToken, isAuthenticated } = store.getState().auth

  if (accessToken) {
    requestConfig.headers.Authorization = `Bearer ${accessToken}`

    if (
      isAuthenticated
      && !shouldSkipAuthLogout(requestConfig)
      && isAccessTokenExpired(accessToken)
    ) {
      clearAuthenticatedSession()
      return Promise.reject(new axios.CanceledError('Session expired'))
    }
  }

  if (applicationToken) {
    requestConfig.headers['Application-Token'] = applicationToken
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
      shouldForceLogoutOn401(error, error.config)
      && store.getState().auth.isAuthenticated
    ) {
      clearAuthenticatedSession()
    }

    return Promise.reject(error)
  },
)

export default apiClient
