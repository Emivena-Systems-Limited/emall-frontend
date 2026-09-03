function formatProductDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function escapeCsvValue(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function exportProductsToExcel(products, filename = 'product-catalog.csv') {
  const headers = [
    'Product Name',
    'SKU',
    'Category',
    'Brand',
    'Price (GHS)',
    'Stock',
    'Status',
    'Date Added',
  ]

  const rows = products.map((product) => [
    product.name,
    product.sku,
    product.category,
    product.brand,
    product.salePrice ?? product.price,
    product.stock,
    product.status,
    formatProductDate(product.createdAt),
  ])

  const csv = [
    headers.map(escapeCsvValue).join(','),
    ...rows.map((row) => row.map(escapeCsvValue).join(',')),
  ].join('\n')

  downloadBlob(`\ufeff${csv}`, filename, 'text/csv;charset=utf-8;')
}
