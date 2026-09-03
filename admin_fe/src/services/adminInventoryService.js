import apiClient from '../lib/apiClient'
import { INVENTORY_PAGE_SIZE, getInventoryListPath, INVENTORY_ADMIN_ENDPOINTS } from '../constants/inventory'
import { assertAuthEnvelope } from '../utils/parseApiError'
import {
  extractInventoryPagination,
  normalizeAdminInventories,
  normalizeAdminInventoryDetail,
  normalizeInventoryStats,
} from '../utils/normalizeAdminInventory'
import { LATEST_FIRST_QUERY } from '../utils/sortLatestFirst'

function compactParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value != null && value !== false),
  )
}

export async function fetchAdminInventory({
  view = '',
  search = '',
  vendorId = '',
  page = 1,
  perPage = INVENTORY_PAGE_SIZE,
} = {}) {
  const { data } = await apiClient.get(getInventoryListPath(view), {
    params: compactParams({
      vendor_id: String(vendorId ?? '').trim(),
      search: String(search ?? '').trim(),
      page,
      per_page: perPage,
      ...LATEST_FIRST_QUERY,
    }),
  })
  const envelope = assertAuthEnvelope(data, 'Could not load inventory.')

  return {
    items: normalizeAdminInventories(envelope),
    pagination: extractInventoryPagination(envelope),
  }
}

export async function fetchAdminInventoryStats() {
  const { data } = await apiClient.get(INVENTORY_ADMIN_ENDPOINTS.STATS)
  const envelope = assertAuthEnvelope(data, 'Could not load inventory stats.')
  return normalizeInventoryStats(envelope)
}

export async function fetchAdminInventoryById(inventoryId) {
  const { data } = await apiClient.get(INVENTORY_ADMIN_ENDPOINTS.byId(inventoryId))
  const envelope = assertAuthEnvelope(data, 'Could not load inventory record.')
  const item = normalizeAdminInventoryDetail(envelope, inventoryId)

  if (!item?.id) {
    const error = new Error('Inventory record not found.')
    error.response = { data: envelope, status: envelope?.status_code ?? 404 }
    throw error
  }

  return item
}
