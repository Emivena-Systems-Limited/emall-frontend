export function flattenCategoryTree(categories = []) {
  const result = []

  for (const category of categories) {
    if (!category?.id || !category?.name) continue

    result.push({ id: category.id, name: category.name })

    if (category.children?.length) {
      result.push(...flattenCategoryTree(category.children))
    }
  }

  return result
}

export function buildCategorySelectOptions(categories = []) {
  return categories.map((category) => ({
    value: category.id,
    label: category.name,
  }))
}

export function buildProductSelectOptions(products = []) {
  return products.map((product) => ({
    value: product.id,
    label: product.name,
    image: product.image ?? null,
    sku: product.sku ?? '',
  }))
}

export function filterProductSelectOptions(options = [], query = '') {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return options

  return options.filter(
    (option) =>
      option.label.toLowerCase().includes(normalized)
      || option.sku.toLowerCase().includes(normalized),
  )
}

export function paginateSelectOptions(options = [], { page = 1, pageSize = 9 } = {}) {
  const totalItems = options.length
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.min(Math.max(1, page), pageCount)
  const start = (safePage - 1) * pageSize

  return {
    items: options.slice(start, start + pageSize),
    page: safePage,
    pageCount,
    totalItems,
    pageSize,
    startIndex: totalItems === 0 ? 0 : start + 1,
    endIndex: Math.min(start + pageSize, totalItems),
  }
}
