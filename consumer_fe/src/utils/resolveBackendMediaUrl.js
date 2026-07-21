export function resolveBackendMediaUrl(value) {
  const source = String(value ?? '').trim()
  if (!source) return ''
  if (/^(https?:|data:|blob:)/i.test(source)) return source

  const apiBaseUrl = String(import.meta.env.API_BASE_URL ?? '/api')
  if (!/^https?:/i.test(apiBaseUrl)) return source.startsWith('/') ? source : `/${source}`

  const backendOrigin = new URL(apiBaseUrl).origin
  const path = source.replace(/^\/+/, '')
  return `${backendOrigin}/${path.startsWith('storage/') ? path : `storage/${path}`}`
}
