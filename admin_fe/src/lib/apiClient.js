import axios from 'axios'
import config from '../utils/Config'

const apiClient = axios.create({
  baseURL: config.base_url,
  timeout: 20000,
})

apiClient.interceptors.request.use((request) => {
  const persistRaw = localStorage.getItem('persist:admin-auth')
  if (!persistRaw) return request

  try {
    const persisted = JSON.parse(persistRaw)
    const accessToken = JSON.parse(persisted.accessToken ?? 'null')
    const applicationToken = JSON.parse(persisted.applicationToken ?? 'null')
    if (accessToken) request.headers.Authorization = `Bearer ${accessToken}`
    if (applicationToken) request.headers['Application-Token'] = applicationToken
  } catch {
    /* ignore malformed persist payload */
  }

  return request
})

export default apiClient
