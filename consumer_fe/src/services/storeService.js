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

export async function getStores(location) {
  const { data } = await apiClient.get('/stores', {
    params: locationParams(location),
    skipAuthLogout: true,
  })
  return unwrap(data)
}

export async function getStore(storeId, location) {
  const { data } = await apiClient.get(`/stores/${storeId}`, {
    params: locationParams(location),
    skipAuthLogout: true,
  })
  return unwrap(data)
}

export async function getStoreProducts(storeId, location) {
  const { data } = await apiClient.get(`/stores/${storeId}/products`, {
    params: locationParams(location),
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
