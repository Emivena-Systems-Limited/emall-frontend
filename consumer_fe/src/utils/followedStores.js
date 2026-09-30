const STORAGE_PREFIX = 'emall:followed-stores'
export const FOLLOWED_STORES_CHANGED_EVENT = 'emall:followed-stores-changed'

function userKey(user) {
  return String(user?.id ?? user?.email ?? user?.phone_number ?? 'anonymous').trim().toLowerCase()
}

function storageKey(user) {
  return `${STORAGE_PREFIX}:${userKey(user)}`
}

function readStoredList(user) {
  if (typeof window === 'undefined') return []
  try {
    const value = JSON.parse(window.localStorage.getItem(storageKey(user)) || '[]')
    return Array.isArray(value) ? value.filter((store) => store?.id && store?.name) : []
  } catch {
    return []
  }
}

function writeStoredList(user, stores) {
  if (typeof window === 'undefined') return stores
  window.localStorage.setItem(storageKey(user), JSON.stringify(stores))
  window.dispatchEvent(new CustomEvent(FOLLOWED_STORES_CHANGED_EVENT, { detail: { stores } }))
  return stores
}

export function getFollowedStores(user) {
  return readStoredList(user)
}

export function isStoreFollowed(user, storeId) {
  return readStoredList(user).some((store) => String(store.id) === String(storeId))
}

export function followStore(user, store) {
  if (!store?.id || !store?.name) return readStoredList(user)
  const current = readStoredList(user)
  const normalized = {
    id: String(store.id),
    name: String(store.name),
    image: store.image || '',
    city: store.city || '',
    region: store.region || '',
    rating: Number(store.rating) || 0,
    followedAt: new Date().toISOString(),
  }
  return writeStoredList(user, [normalized, ...current.filter((entry) => String(entry.id) !== normalized.id)])
}

export function unfollowStore(user, storeId) {
  return writeStoredList(user, readStoredList(user).filter((store) => String(store.id) !== String(storeId)))
}
