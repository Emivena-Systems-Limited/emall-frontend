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

const MAX_IN_STOCK_PAGES = 20

function compactParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value != null && value !== false),
  )
}

async function fetchInventoryPage({
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

async function fetchInStockInventory({ search = '', vendorId = '', page = 1, perPage = INVENTORY_PAGE_SIZE } = {}) {
  const first = await fetchInventoryPage({ search, vendorId, page: 1, perPage })
  const collected = [...first.items]
  const lastPage = Math.min(first.pagination.lastPage, MAX_IN_STOCK_PAGES)

  for (let nextPage = 2; nextPage <= lastPage; nextPage += 1) {
    const batch = await fetchInventoryPage({ search, vendorId, page: nextPage, perPage })
    collected.push(...batch.items)
  }

  const inStock = collected.filter((item) => item.status === 'in_stock')
  const total = inStock.length
  const pageCount = Math.max(1, Math.ceil(total / perPage) || 1)
  const safePage = Math.min(Math.max(Number(page) || 1, 1), pageCount)
  const start = (safePage - 1) * perPage
  const items = inStock.slice(start, start + perPage)

  return {
    items,
    pagination: {
      page: safePage,
      lastPage: pageCount,
      perPage,
      total,
      from: items.length ? start + 1 : 0,
      to: items.length ? start + items.length : 0,
    },
  }
}

export async function fetchAdminInventory({
  view = '',
  search = '',
  vendorId = '',
  page = 1,
  perPage = INVENTORY_PAGE_SIZE,
} = {}) {
  if (view === 'in_stock') {
    return fetchInStockInventory({ search, vendorId, page, perPage })
  }

  return fetchInventoryPage({ view, search, vendorId, page, perPage })
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
