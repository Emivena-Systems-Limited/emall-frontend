export const ANALYTICS_DATE_RANGES = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: '12m', label: '12 months' },
]

export const ANALYTICS_EXPORT_DATE_PRESETS = [
  ...ANALYTICS_DATE_RANGES,
  { value: 'year', label: 'This year' },
]

export const ANALYTICS_EXPORT_REPORT_KEYS = {
  SUMMARY: 'summary',
  SALES_BY_CATEGORY: 'sales_by_category',
  CUSTOMER_GROWTH: 'customer_growth',
  SALES_BY_REGION: 'sales_by_region',
  TOP_PRODUCTS: 'top_products',
  ORDER_FULFILLMENT: 'order_fulfillment',
}

export const ANALYTICS_MONTHS = [
  { value: 1, label: 'January', short: 'Jan' },
  { value: 2, label: 'February', short: 'Feb' },
  { value: 3, label: 'March', short: 'Mar' },
  { value: 4, label: 'April', short: 'Apr' },
  { value: 5, label: 'May', short: 'May' },
  { value: 6, label: 'June', short: 'Jun' },
  { value: 7, label: 'July', short: 'Jul' },
  { value: 8, label: 'August', short: 'Aug' },
  { value: 9, label: 'September', short: 'Sep' },
  { value: 10, label: 'October', short: 'Oct' },
  { value: 11, label: 'November', short: 'Nov' },
  { value: 12, label: 'December', short: 'Dec' },
]

export const ANALYTICS_FULFILLMENT_PERIODS = [
  { value: 'current_year', label: 'Current year' },
  { value: 'year', label: 'Specific year' },
  { value: 'month', label: 'Specific month' },
  { value: 'year_range', label: 'Year range' },
  { value: 'month_range', label: 'Month range' },
]

export const ANALYTICS_EXPORT_REPORTS = [
  {
    key: 'summary',
    label: 'Store summary',
    description: 'KPI totals for revenue, orders, customers, AOV, conversion and returns.',
  },

  {
    key: 'sales_by_category',
    label: 'Sales by category',
    description: 'Revenue split across parent product categories.',
  },
  {
    key: 'customer_growth',
    label: 'Customer growth',
    description: 'New vs returning buyers by month.',
  },
  {
    key: 'sales_by_region',
    label: 'Sales by region',
    description: 'Completed sales grouped by shipping region.',
  },
  {
    key: 'top_products',
    label: 'Top products',
    description: 'Best-selling products by revenue, units and trend.',
  },
  {
    key: 'order_fulfillment',
    label: 'Order fulfilment',
    description: 'Fulfilled, pending, cancelled and returned order counts.',
  },

]

/**
 * KPI cards use start_date + end_date.
 * Charts and tables below the cards use year only.
 */
export const ANALYTICS_ENDPOINTS = {
  SUMMARY: '/api/vendor/analytics/summary',
  REVENUE_ORDERS: '/api/vendor/analytics/revenue-orders',
  SALES_BY_CATEGORY: '/api/vendor/analytics/sales-by-category',
  CUSTOMER_GROWTH: '/api/vendor/analytics/customer-growth',
  SALES_BY_REGION: '/api/vendor/analytics/sales-by-region',
  TOP_PRODUCTS: '/api/vendor/analytics/top-products',
  FULFILLMENT: '/api/vendor/analytics/fulfillment',
  EXPORT: '/api/vendor/analytics/reports',
}

export const REPORT_TABS = {
  overview: { label: 'Overview', description: 'Key metrics at a glance' },
  sales: { label: 'Sales', description: 'Revenue and order trends' },
  customers: { label: 'Customers', description: 'Growth and retention' },
  products: { label: 'Products', description: 'Catalogue performance' },
}

export const CATEGORY_COLORS = ['#c73b2d', '#0f8f9c', '#f97316', '#8b5cf6', '#059669', '#e11d48']
