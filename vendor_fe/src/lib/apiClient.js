import axios from 'axios'
import config from '../utils/Config'
import { logout } from '../store/slices/authSlice'
import { persistor, store } from '../store/store'

const apiClient = axios.create({
  baseURL: config.base_url,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

apiClient.interceptors.request.use((requestConfig) => {
  const { accessToken, applicationToken } = store.getState().auth

  if (accessToken) {
    requestConfig.headers.Authorization = `Bearer ${accessToken}`
  }

  if (applicationToken) {
    requestConfig.headers['Application-Token'] = applicationToken
  }

  return requestConfig
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && store.getState().auth.isAuthenticated) {
      store.dispatch(logout())
      persistor.persist()
    }

    return Promise.reject(error)
  },
)

export default apiClient
