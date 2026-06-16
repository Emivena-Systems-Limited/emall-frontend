export const SALES_OVERVIEW_DATA = {
  today: [
    { label: '6 AM', sales: 420 },
    { label: '8 AM', sales: 1280 },
    { label: '10 AM', sales: 2140 },
    { label: '12 PM', sales: 3560 },
    { label: '2 PM', sales: 2890 },
    { label: '4 PM', sales: 4120 },
    { label: '6 PM', sales: 5380 },
    { label: '8 PM', sales: 3210 },
  ],
  week: [
    { label: 'Mon', sales: 6200 },
    { label: 'Tue', sales: 8400 },
    { label: 'Wed', sales: 7100 },
    { label: 'Thu', sales: 9800 },
    { label: 'Fri', sales: 11200 },
    { label: 'Sat', sales: 13400 },
    { label: 'Sun', sales: 10800 },
  ],
  month: [
    { label: 'Week 1', sales: 28400 },
    { label: 'Week 2', sales: 32100 },
    { label: 'Week 3', sales: 29800 },
    { label: 'Week 4', sales: 35600 },
  ],
}

export const SALES_RANGE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'custom', label: 'Custom Range' },
]

export const SPARK_DATA = {
  revenue: [24, 18, 52, 39, 68, 47, 81, 72, 94, 112, 138, 165].map((v) => ({ v })),
  orders: [18, 14, 41, 29, 53, 37, 64, 58, 75, 89, 110, 132].map((v) => ({ v })),
  products: [3, 3, 5, 5, 7, 7, 9, 10, 10, 12, 14, 14].map((v) => ({ v })),
  customers: [6, 8, 14, 19, 28, 31, 44, 49, 62, 74, 91, 108].map((v) => ({ v })),
  lowStock: [8, 7, 9, 6, 8, 7, 5, 7, 6, 8, 7, 7].map((v) => ({ v })),
}

export const REVENUE_TIMELINE = [
  { month: 'Jan', revenue: 2400, orders: 18 },
  { month: 'Feb', revenue: 1800, orders: 14 },
  { month: 'Mar', revenue: 5200, orders: 41 },
  { month: 'Apr', revenue: 3900, orders: 29 },
  { month: 'May', revenue: 6800, orders: 53 },
  { month: 'Jun', revenue: 4700, orders: 37 },
  { month: 'Jul', revenue: 8100, orders: 64 },
  { month: 'Aug', revenue: 7200, orders: 58 },
  { month: 'Sep', revenue: 9400, orders: 75 },
  { month: 'Oct', revenue: 11200, orders: 89 },
  { month: 'Nov', revenue: 13800, orders: 110 },
  { month: 'Dec', revenue: 16500, orders: 132 },
]

export const FULFILLMENT_TIMELINE = [
  { month: 'Jan', fulfilled: 12, pending: 8 },
  { month: 'Feb', fulfilled: 10, pending: 7 },
  { month: 'Mar', fulfilled: 34, pending: 12 },
  { month: 'Apr', fulfilled: 24, pending: 9 },
  { month: 'May', fulfilled: 44, pending: 14 },
  { month: 'Jun', fulfilled: 31, pending: 11 },
  { month: 'Jul', fulfilled: 52, pending: 16 },
  { month: 'Aug', fulfilled: 48, pending: 13 },
  { month: 'Sep', fulfilled: 61, pending: 18 },
  { month: 'Oct', fulfilled: 74, pending: 20 },
  { month: 'Nov', fulfilled: 92, pending: 22 },
  { month: 'Dec', fulfilled: 108, pending: 24 },
]

export const ORDER_STATUS_DONUT = [
  { name: 'Electronics', value: 54701, color: '#0f8f9c' },
  { name: 'Fashion', value: 32210, color: '#28b6cf' },
  { name: 'Home & Living', value: 24410, color: '#14b8a6' },
]

export const PENDING_FULFILLMENT = [
  { id: '#ORD-1046', customer: 'Kofi Mensah', product: 'Wireless Earbuds Pro', qty: 2, amount: 490, waiting: '45m ago' },
  { id: '#ORD-1045', customer: 'Ama Darko', product: 'Smart Watch Series 4', qty: 1, amount: 890, waiting: '1h ago' },
  { id: '#ORD-1044', customer: 'Kwame Asante', product: 'Running Sneakers', qty: 1, amount: 340, waiting: '2h ago' },
  { id: '#ORD-1043', customer: 'Abena Owusu', product: 'Portable Blender', qty: 3, amount: 360, waiting: '3h ago' },
  { id: '#ORD-1042', customer: 'Yaw Boateng', product: 'Desk LED Lamp', qty: 2, amount: 240, waiting: '5h ago' },
  { id: '#ORD-1041', customer: 'Efua Adjei', product: 'USB-C Hub 7-in-1', qty: 1, amount: 185, waiting: '6h ago' },
]

export const YEARLY_ORDER_ACTIVITY = [
  { month: 'Jan', newOrders: 18, fulfilled: 12 },
  { month: 'Feb', newOrders: 14, fulfilled: 10 },
  { month: 'Mar', newOrders: 41, fulfilled: 34 },
  { month: 'Apr', newOrders: 29, fulfilled: 24 },
  { month: 'May', newOrders: 53, fulfilled: 44 },
  { month: 'Jun', newOrders: 37, fulfilled: 31 },
  { month: 'Jul', newOrders: 64, fulfilled: 52 },
  { month: 'Aug', newOrders: 58, fulfilled: 48 },
  { month: 'Sep', newOrders: 75, fulfilled: 61 },
  { month: 'Oct', newOrders: 89, fulfilled: 74 },
  { month: 'Nov', newOrders: 110, fulfilled: 92 },
  { month: 'Dec', newOrders: 132, fulfilled: 108 },
]

export const AVATAR_HUE = [
  'bg-violet-600',
  'bg-rose-500',
  'bg-sky-600',
  'bg-amber-500',
  'bg-teal-600',
  'bg-indigo-600',
]

export const CHART_YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

export const KPI_STATS = [
  {
    id: 'total-income',
    label: 'Total Income',
    value: 'GH₵ 994,373',
    changeText: '43%',
    helper: 'Compared to last month',
    isPositive: true,
    sparkKey: 'revenue',
    iconKey: 'revenue',
    accentColor: '#0f8f9c',
  },
  {
    id: 'orders-today',
    label: 'Orders Today',
    value: '24',
    changeText: '18%',
    helper: 'Compared to yesterday',
    isPositive: true,
    sparkKey: 'orders',
    iconKey: 'ordersToday',
    accentColor: '#0f8f9c',
  },
  {
    id: 'pending-orders',
    label: 'Pending Orders',
    value: '12',
    changeText: '12%',
    helper: 'Compared to last month',
    isPositive: false,
    sparkKey: 'products',
    iconKey: 'pendingOrders',
    accentColor: '#f97316',
  },
  {
    id: 'low-stock',
    label: 'Low Stock Products',
    value: '7',
    changeText: '3',
    helper: 'Items below threshold',
    isPositive: false,
    sparkKey: 'lowStock',
    iconKey: 'lowStock',
    accentColor: '#f97316',
  },
]
