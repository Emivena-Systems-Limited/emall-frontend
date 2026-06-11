import axios from 'axios'
import { logout } from '../store/slices/authSlice'
import { store } from '../store/store'

const apiClient = axios.create({
  baseURL: import.meta.env.API_BASE_URL ?? '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

apiClient.interceptors.request.use((config) => {
  const { accessToken } = store.getState().auth

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && store.getState().auth.isAuthenticated) {
      store.dispatch(logout())
    }

    return Promise.reject(error)
  },
)

export default apiClient
