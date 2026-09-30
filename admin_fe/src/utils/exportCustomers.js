import { formatUserDate } from './normalizeAdminUsers'

function escapeCell(value) {
  const text = String(value ?? '')
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function exportCustomersCsv(customers = []) {
  const headers = [
    'Customer',
    'Customer ID',
    'Email',
    'Phone Number',
    'Location',
    'Total Orders',
    'Total Spent',
    'Account Status',
    'Date Joined',
  ]
  const rows = customers.map((customer) => [
    customer.name,
    customer.id,
    customer.email,
    customer.phone,
    customer.locationLabel,
    customer.counts?.orders ?? 0,
    customer.counts?.spent ?? 0,
    customer.status,
    formatUserDate(customer.joinedAt),
  ])
  const csv = [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `customers-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
