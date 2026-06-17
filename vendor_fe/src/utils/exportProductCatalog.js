function formatProductDate(value) {
  return new Date(value).toLocaleDateString('en-GB', {
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
    product.price,
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

export function exportProductsToPdf(products, title = 'Product Catalogue') {
  const rows = products.map((product) => `
    <tr>
      <td>${product.name}</td>
      <td>${product.sku}</td>
      <td>${product.category}</td>
      <td>${product.brand}</td>
      <td>GH₵ ${product.price.toLocaleString()}</td>
      <td>${product.stock}</td>
      <td>${product.status}</td>
      <td>${formatProductDate(product.createdAt)}</td>
    </tr>
  `).join('')

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
          h1 { font-size: 20px; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
          th { background: #f8fafc; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Date Added</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `

  const printWindow = window.open('', '_blank', 'noopener,noreferrer')
  if (!printWindow) return false

  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
  return true
}
