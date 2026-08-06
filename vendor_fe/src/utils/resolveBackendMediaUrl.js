import config from './Config'

export function resolveBackendMediaUrl(value) {
  const source = String(value ?? '').trim()
  if (!source) return ''
  if (/^(https?:|data:|blob:)/i.test(source)) return source

  const apiBaseUrl = String(import.meta.env.VITE_API_BASE_URL ?? config.base_url ?? '')
  if (!/^https?:/i.test(apiBaseUrl)) {
    return source.startsWith('/') ? source : `/${source}`
  }

  const backendOrigin = new URL(apiBaseUrl.includes('/api') ? apiBaseUrl : `${apiBaseUrl}/api`).origin
  const path = source.replace(/^\/+/, '')
  return `${backendOrigin}/${path.startsWith('storage/') ? path : `storage/${path}`}`
}
