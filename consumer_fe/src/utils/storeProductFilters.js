export function uniqueStoreOptions(products, valueKey, labelKey = valueKey) {
  const options = new Map()
  products.forEach((product) => {
    const value = product[valueKey]
    const label = product[labelKey]
    if (value == null || value === '' || !label) return
    const id = String(value)
    if (!options.has(id)) options.set(id, { id, label: String(label) })
  })
  return [...options.values()].sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }))
}

export function uniqueStoreVariantColors(products = []) {
  const colors = new Map()

  products.forEach((product) => {
    const variants = Array.isArray(product.variants) ? product.variants : []
    variants.forEach((variant) => {
      const color = String(variant?.color ?? '').trim()
      if (!color || colors.has(color)) return
      colors.set(color, { id: color, label: color })
    })
  })

  return [...colors.values()].sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }))
}

export function uniqueStoreVariantSizes(products = []) {
  const sizes = new Map()

  products.forEach((product) => {
    const variants = Array.isArray(product.variants) ? product.variants : []
    variants.forEach((variant) => {
      const size = String(variant?.size ?? '').trim()
      if (!size || sizes.has(size)) return
      sizes.set(size, { id: size, label: size })
    })
  })

  return [...sizes.values()].sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }))
}

export function groupStoreSubcategories(products = [], categoryId = '') {
  const source = categoryId
    ? products.filter((product) => String(product.categoryId) === String(categoryId))
    : products
  const groups = new Map()

  source.forEach((product) => {
    if (product.subcategoryId == null || product.subcategoryId === '' || !product.subcategory) return
    const parentKey = String(product.categoryId || 'other')
    if (!groups.has(parentKey)) {
      groups.set(parentKey, {
        id: parentKey,
        name: product.category || 'Other',
        children: new Map(),
      })
    }
    groups.get(parentKey).children.set(String(product.subcategoryId), {
      id: String(product.subcategoryId),
      label: product.subcategory,
    })
  })

  return [...groups.values()]
    .map((group) => ({
      id: group.id,
      name: group.name,
      children: [...group.children.values()].sort((a, b) => a.label.localeCompare(b.label)),
    }))
    .filter((group) => group.children.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function toggleStoreFilterValue(currentValue, nextValue) {
  return String(currentValue) === String(nextValue) ? '' : nextValue
}

export function countStoreSidebarFilters(filters = {}, query = '') {
  let count = 0
  if (String(query).trim()) count += 1
  if (filters.categoryId) count += 1
  if (filters.subcategoryId) count += 1
  if (filters.promotional) count += 1
  if (filters.brandId) count += 1
  if (filters.color) count += 1
  if (filters.size) count += 1
  if (filters.minPrice || filters.maxPrice) count += 1
  return count
}
