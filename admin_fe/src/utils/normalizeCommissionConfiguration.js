function firstText(...values) {
  for (const value of values) {
    if (value == null || typeof value === 'object') continue
    const text = String(value).trim()
    if (text) return text
  }
  return ''
}

function nestedRecord(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

function asRate(value) {
  if (value == null || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function asDefaultRate(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 10
}

export function normalizeCommissionConfiguration(payload) {
  const source = payload && typeof payload === 'object' ? payload : {}
  const vendors = Array.isArray(source.vendors) ? source.vendors : []
  const categories = Array.isArray(source.categories) ? source.categories : []

  return {
    defaultRate: asDefaultRate(source.defaultRate ?? source.default_rate ?? source.default_commission_rate),
    vendors: vendors
      .map((item) => {
        const vendor = nestedRecord(item?.vendor)
        const store = nestedRecord(item?.store ?? vendor.store)
        return {
          vendorId: firstText(item?.vendorId, item?.vendor_id, vendor.id, vendor.vendor_id, item?.id),
          vendorName: firstText(
            item?.vendorName,
            item?.vendor_name,
            item?.store_name,
            item?.storeName,
            item?.business_name,
            item?.businessName,
            item?.trading_name,
            item?.shop_name,
            vendor.store_name,
            vendor.storeName,
            vendor.business_name,
            vendor.businessName,
            vendor.trading_name,
            vendor.shop_name,
            vendor.vendor_name,
            vendor.vendorName,
            store.store_name,
            store.storeName,
            store.name,
            item?.name,
            vendor.name,
          ),
          rate: asRate(item?.rate ?? vendor.rate),
        }
      })
      .filter((item) => item.vendorId),
    categories: categories
      .map((item) => ({
        id: String(item?.id ?? item?.categoryId ?? item?.category_id ?? ''),
        name: item?.name ?? item?.categoryName ?? item?.category_name ?? 'Untitled category',
        rate: asRate(item?.rate),
      }))
      .filter((item) => item.id),
  }
}
