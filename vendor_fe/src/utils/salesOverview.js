import { SALES_OVERVIEW_DATA } from '../constants/dashboardData'

function toDateInputValue(date) {
  return date.toISOString().slice(0, 10)
}

export function getDefaultCustomRange() {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - 6)
  return {
    startDate: toDateInputValue(start),
    endDate: toDateInputValue(end),
  }
}

export function buildCustomSalesData(startDate, endDate) {
  const start = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${endDate}T00:00:00`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return []
  }

  const points = []
  const cursor = new Date(start)

  while (cursor <= end && points.length < 31) {
    const index = points.length
    points.push({
      label: cursor.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      sales: 4200 + ((index * 1737) % 4800) + (index % 3) * 600,
    })
    cursor.setDate(cursor.getDate() + 1)
  }

  return points
}

export function getSalesOverviewData(range, customRange) {
  if (range === 'custom') {
    return buildCustomSalesData(customRange.startDate, customRange.endDate)
  }
  return SALES_OVERVIEW_DATA[range] ?? SALES_OVERVIEW_DATA.week
}

export function getSalesTotal(data) {
  return data.reduce((sum, point) => sum + point.sales, 0)
}

const SALES_SEGMENT_COLORS = [
  '#0f8f9c',
  '#c73b2d',
  '#28b6cf',
  '#14b8a6',
  '#f97316',
  '#6366f1',
  '#ec4899',
  '#84cc16',
]

export function getSalesDonutData(data) {
  return data.map((point, index) => ({
    name: point.label,
    value: point.sales,
    color: SALES_SEGMENT_COLORS[index % SALES_SEGMENT_COLORS.length],
  }))
}

export function getRangeSummaryLabel(range, customRange) {
  if (range === 'today') return 'Sales today'
  if (range === 'week') return 'Sales this week'
  if (range === 'month') return 'Sales this month'
  if (range === 'custom') {
    const start = new Date(`${customRange.startDate}T00:00:00`).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    })
    const end = new Date(`${customRange.endDate}T00:00:00`).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    return `${start} – ${end}`
  }
  return 'Sales overview'
}
