export function formatCurrency(amount) {
  if (!amount) return 'GH₵ 0'
  return `GH₵ ${amount.toLocaleString('en-GH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export function computeTrendPercent(current, previous) {
  if (!previous || previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

export function getDefaultCustomRange() {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  }
}

export function sliceTimelineByRange(timeline, range) {
  if (!timeline?.length) return []
  switch (range) {
    case '7d':
      return timeline.slice(-2)
    case '30d':
      return timeline.slice(-4)
    case '90d':
      return timeline.slice(-6)
    case '12m':
    default:
      return timeline
  }
}

export function exportAnalyticsCsv(data) {
  const rows = [
    ['Metric', 'Value'],
    ['Revenue', data.summary.revenue],
    ['Orders', data.summary.orders],
    ['Customers', data.summary.customers],
    ['Conversion Rate (%)', data.summary.conversionRate],
    ['Avg Order Value', data.summary.avgOrderValue],
    ['Return Rate (%)', data.summary.returnRate],
    [],
    ['Top Products'],
    ['Product', 'Category', 'Units', 'Revenue', 'Trend (%)'],
    ...data.topProducts.map((p) => [p.name, p.category, p.units, p.revenue, p.trend]),
  ]

  const csv = rows.map((row) => row.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `analytics-report-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function hasAnalyticsData(data) {
  return (data.summary?.revenue ?? 0) > 0 || (data.revenueTimeline?.length ?? 0) > 0
}
