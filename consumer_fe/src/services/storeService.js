import apiClient from '../lib/apiClient'

function assertSuccess(payload, fallbackMessage) {
  if (!payload?.in_error) return payload
  const error = new Error(payload.message || payload.reason || fallbackMessage)
  error.response = { data: payload }
  throw error
}

function unwrap(payload) {
  assertSuccess(payload, 'Unable to load store information')
  return payload?.data ?? payload ?? null
}

function locationParams(location) {
  return {
    region: location?.region || undefined,
    city: location?.city || undefined,
  }
}

function cleanParams(params) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''))
}

export async function getStores(location, options = {}) {
  const { data } = await apiClient.get('/stores', {
    params: cleanParams({
      ...locationParams(location),
      search: options.search,
      popular: options.popular,
      sort: options.sort,
      page: options.page,
      per_page: options.perPage,
    }),
    skipAuthLogout: true,
  })
  return unwrap(data)
}

export async function getStore(storeId, location) {
  const { data } = await apiClient.get(`/stores/${storeId}`, {
    params: locationParams(location),
    // Store details are public. Sending the authenticated session currently
    // triggers the backend StoreFollowService while the response already has a
    // dedicated follow-status endpoint on the frontend.
    guestSessionOnly: true,
    skipAuthLogout: true,
  })
  return unwrap(data)
}

export async function getStoreProducts(storeId, location, options = {}) {
  const { data } = await apiClient.get(`/stores/${storeId}/products`, {
    params: cleanParams({
      ...locationParams(location),
      search: options.search,
      category_id: options.categoryId,
      subcategory_id: options.subcategoryId,
      brand_id: options.brandId,
      color: options.color,
      size: options.size,
      min_price: options.minPrice,
      max_price: options.maxPrice,
      promotional: options.promotional,
      sort: options.sort,
      page: options.page,
      per_page: options.perPage,
    }),
    // The directory is public. Follow information is loaded separately so a
    // signed-in session cannot make the public catalogue depend on the
    // backend's authenticated follow-status enrichment.
    guestSessionOnly: true,
    skipAuthLogout: true,
  })
  return unwrap(data)
}

export async function getStoreReviews(storeId, options = {}) {
  const { data } = await apiClient.get(`/stores/${storeId}/reviews`, {
    params: cleanParams({ page: options.page ?? 1, per_page: options.perPage ?? 10 }),
    guestSessionOnly: true,
    skipAuthLogout: true,
  })
  return unwrap(data)
}

export async function getStoreDeliveryEligibility(storeId, location) {
  const { data } = await apiClient.get(`/stores/${storeId}/delivery-eligibility`, {
    params: locationParams(location),
    skipAuthLogout: true,
  })
  return unwrap(data)
}

export async function getProductDeliveryEligibility(productId, location) {
  const { data } = await apiClient.get(`/product/${productId}/delivery-eligibility`, {
    params: locationParams(location),
    skipAuthLogout: true,
  })
  return unwrap(data)
}

export async function getSavedDeliveryLocation() {
  const { data } = await apiClient.get('/user/delivery-location')
  return unwrap(data)
}

export async function saveDeliveryLocation(location) {
  const { data } = await apiClient.put('/user/delivery-location', {
    region: location.region,
    city: location.city,
    ...(location.latitude != null ? { latitude: location.latitude } : {}),
    ...(location.longitude != null ? { longitude: location.longitude } : {}),
  })
  return unwrap(data)
}

export async function checkStoresDeliveryEligibility(payload) {
  const { data } = await apiClient.post('/stores/delivery-eligibility', payload, {
    skipAuthLogout: true,
  })
  return unwrap(data)
}

export async function checkProductsDeliveryEligibility(payload) {
  const { data } = await apiClient.post('/product/delivery-eligibility/bulk', payload, {
    skipAuthLogout: true,
  })
  return unwrap(data)
}

export async function getFollowedStores(params = {}) {
  const { data } = await apiClient.get('/user/followed-stores', {
    params: {
      page: params.page ?? 1,
      per_page: params.perPage ?? 9,
      search: params.search || undefined,
      region: params.region || undefined,
      city: params.city || undefined,
    },
  })
  return unwrap(data)
}

export async function getStoreFollowStatus(storeId) {
  const { data } = await apiClient.get(`/stores/${storeId}/follow-status`)
  const payload = unwrap(data)
  return Boolean(
    payload?.is_following
      ?? payload?.isFollowing
      ?? payload?.followed
      ?? payload?.following,
  )
}

export async function followStore(storeId) {
  const { data } = await apiClient.post(`/stores/${storeId}/follow`)
  return unwrap(data)
}

export async function unfollowStore(storeId) {
  const { data } = await apiClient.delete(`/stores/${storeId}/unfollow`)
  return unwrap(data)
}
