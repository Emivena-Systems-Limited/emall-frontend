export const ADMIN_DEMO = {
  email: 'leo.a@example.org',
  password: 'Admin@123',
  user: {
    id: 'adm_ama_mensah',
    first_name: 'Ama',
    last_name: 'Mensah',
    full_name: 'Ama Mensah',
    email: 'leo.a@example.org',
    phone_number: '233244123456',
    role: 'Super Admin',
    status: 'active',
    avatar_url: null,
    created_at: '2025-01-12T09:00:00+00:00',
    last_login_at: '2026-09-02T08:40:00+00:00',
    email_verified_at: '2025-01-12T09:10:00+00:00',
    notification_preferences: {
      vendor_applications: true,
      flagged_listings: true,
      payout_holds: true,
      support_tickets: true,
      live_orders: false,
    },
  },
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function orderStatusYear(rows) {
  return MONTH_LABELS.map((label, index) => {
    const [pending, processing, shipped, delivered] = rows[index]
    return { label, pending, processing, shipped, delivered }
  })
}

export const GHANA_REGIONS = [
  'Ahafo',
  'Ashanti',
  'Bono',
  'Bono East',
  'Central',
  'Eastern',
  'Greater Accra',
  'North East',
  'Northern',
  'Oti',
  'Savannah',
  'Upper East',
  'Upper West',
  'Volta',
  'Western',
  'Western North',
]

function regionSalesYear(salesByRegion) {
  return GHANA_REGIONS.map((name) => ({
    name,
    sales: Number(salesByRegion[name]) || 0,
  }))
}

export const REGION_SALES_VENDORS = [
  { key: 'all', name: 'All vendors' },
  {
    key: 'kente-house',
    name: 'Kente House',
    focus: ['Greater Accra', 'Ashanti', 'Eastern', 'Volta'],
    focusShare: 0.14,
    otherShare: 0.028,
    orderShare: 0.1,
    statusBias: { pending: 0.7, processing: 0.85, shipped: 1.05, delivered: 1.2 },
  },
  {
    key: 'accra-atelier',
    name: 'Accra Atelier',
    focus: ['Greater Accra', 'Eastern', 'Central'],
    focusShare: 0.11,
    otherShare: 0.022,
    orderShare: 0.08,
    statusBias: { pending: 0.9, processing: 1.15, shipped: 1.1, delivered: 0.95 },
  },
  {
    key: 'northern-grain',
    name: 'Northern Grain Co.',
    focus: ['Northern', 'North East', 'Savannah', 'Upper East', 'Upper West'],
    focusShare: 0.16,
    otherShare: 0.018,
    orderShare: 0.07,
    statusBias: { pending: 1.25, processing: 1.2, shipped: 0.9, delivered: 0.8 },
  },
  {
    key: 'coastal-home',
    name: 'Coastal Home',
    focus: ['Central', 'Western', 'Western North', 'Greater Accra'],
    focusShare: 0.13,
    otherShare: 0.024,
    orderShare: 0.09,
    statusBias: { pending: 0.8, processing: 0.9, shipped: 1.2, delivered: 1.05 },
  },
  {
    key: 'kumasi-crafts',
    name: 'Kumasi Crafts',
    focus: ['Ashanti', 'Bono', 'Bono East', 'Ahafo'],
    focusShare: 0.15,
    otherShare: 0.02,
    orderShare: 0.085,
    statusBias: { pending: 1.1, processing: 1.05, shipped: 0.95, delivered: 0.9 },
  },
  {
    key: 'labadi-lights',
    name: 'Labadi Lights',
    focus: ['Greater Accra', 'Eastern', 'Volta', 'Oti'],
    focusShare: 0.12,
    otherShare: 0.021,
    orderShare: 0.075,
    statusBias: { pending: 0.85, processing: 1.1, shipped: 1.25, delivered: 0.88 },
  },
]

export function getRegionalSales(year, vendorKey = 'all') {
  const all = ADMIN_DASHBOARD.salesByRegionByYear[year] ?? []
  const vendor = REGION_SALES_VENDORS.find((item) => item.key === vendorKey)
  if (!vendor || vendor.key === 'all') return all

  const focus = new Set(vendor.focus)
  return all.map((row) => ({
    name: row.name,
    sales: Math.round((Number(row.sales) || 0) * (focus.has(row.name) ? vendor.focusShare : vendor.otherShare)),
  }))
}

export function getOrderStatuses(year, vendorKey = 'all') {
  const all = ADMIN_DASHBOARD.orderStatusesByYear[year] ?? []
  const vendor = REGION_SALES_VENDORS.find((item) => item.key === vendorKey)
  if (!vendor || vendor.key === 'all') return all

  const share = vendor.orderShare ?? 0.1
  const bias = vendor.statusBias ?? {}
  return all.map((point) => ({
    label: point.label,
    pending: Math.max(0, Math.round(point.pending * share * (bias.pending ?? 1))),
    processing: Math.max(0, Math.round(point.processing * share * (bias.processing ?? 1))),
    shipped: Math.max(0, Math.round(point.shipped * share * (bias.shipped ?? 1))),
    delivered: Math.max(0, Math.round(point.delivered * share * (bias.delivered ?? 1))),
  }))
}

export const ORDER_STATUS_SERIES = [
  { key: 'pending', name: 'Pending', color: '#d97706', badgeClass: 'bg-amber-50 text-amber-800 ring-amber-200' },
  { key: 'processing', name: 'Processing', color: '#0284c7', badgeClass: 'bg-sky-50 text-sky-800 ring-sky-200' },
  { key: 'shipped', name: 'Shipped', color: '#4f46e5', badgeClass: 'bg-indigo-50 text-indigo-800 ring-indigo-200' },
  { key: 'delivered', name: 'Delivered', color: '#059669', badgeClass: 'bg-emerald-50 text-emerald-800 ring-emerald-200' },
]

export function getOrderStatusMeta(status) {
  return ORDER_STATUS_SERIES.find((series) => series.key === status) ?? {
    key: status,
    name: status ? String(status).replace(/_/g, ' ') : 'Unknown',
    color: '#64748b',
    badgeClass: 'bg-slate-50 text-slate-700 ring-slate-200',
  }
}

export const ADMIN_DASHBOARD = {
  generatedAt: '2026-08-31T09:40:00+00:00',
  kpis: [
    { key: 'gmv', label: 'Sales (30d)', value: 1842500, format: 'cedi', helper: 'Paid order value', spark: [42, 48, 45, 52, 61, 70, 64] },
    { key: 'vendors', label: 'Live vendors', value: 312, format: 'count', helper: 'Approved & selling', spark: [28, 30, 31, 33, 34, 36, 38] },
    { key: 'orders', label: 'Orders today', value: 486, format: 'count', helper: 'Completed + pending', spark: [36, 40, 38, 44, 52, 58, 49] },
    { key: 'listings', label: 'Live listings', value: 8640, format: 'count', helper: 'Published products', spark: [50, 52, 51, 54, 55, 57, 58] },
  ],
  attention: [
    {
      id: 'p1',
      to: '/products',
      status: 'pending',
      label: 'Kente ceremonial wrap',
      detail: 'Kente House · submitted 2 days ago',
      image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=160&h=160&fit=crop',
    },
    {
      id: 'p2',
      to: '/products',
      status: 'pending',
      label: 'Shea butter 250ml',
      detail: 'Northern Grain Co. · submitted yesterday',
      image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=160&h=160&fit=crop',
    },
    {
      id: 'p3',
      to: '/products',
      status: 'pending',
      label: 'Handwoven basket set',
      detail: 'Kumasi Crafts · submitted yesterday',
      image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=160&h=160&fit=crop',
    },
    {
      id: 'p4',
      to: '/products',
      status: 'pending',
      label: 'Labadi table lamp',
      detail: 'Labadi Lights · submitted today',
      image: 'https://images.unsplash.com/photo-1507473889455-b7bdd458ad14?w=160&h=160&fit=crop',
    },
  ],
  salesMix: [
    { name: 'Fashion & apparel', sales: 186400, color: '#c73b2d' },
    { name: 'Home & living', sales: 128200, color: '#0284c7' },
    { name: 'Beauty & wellness', sales: 97800, color: '#7c3aed' },
    { name: 'Food & grocery', sales: 72900, color: '#059669' },
  ],
  orderStatusYears: [2024, 2025, 2026],
  orderStatusesByYear: {
    2024: orderStatusYear([
      [180, 220, 260, 340],
      [160, 200, 240, 320],
      [190, 240, 280, 380],
      [175, 225, 265, 360],
      [200, 250, 300, 410],
      [190, 245, 310, 430],
      [210, 270, 330, 450],
      [220, 285, 345, 440],
      [205, 260, 320, 410],
      [215, 275, 340, 450],
      [240, 300, 380, 510],
      [260, 330, 420, 580],
    ]),
    2025: orderStatusYear([
      [200, 250, 300, 390],
      [185, 235, 280, 370],
      [220, 275, 330, 430],
      [205, 255, 310, 410],
      [235, 290, 350, 460],
      [225, 280, 360, 490],
      [250, 310, 385, 520],
      [270, 340, 430, 500],
      [255, 320, 390, 470],
      [240, 300, 370, 455],
      [270, 340, 420, 560],
      [300, 380, 480, 650],
    ]),
    2026: orderStatusYear([
      [210, 270, 330, 470],
      [195, 250, 310, 440],
      [225, 290, 360, 520],
      [215, 275, 340, 490],
      [240, 310, 390, 550],
      [235, 305, 400, 580],
      [255, 330, 420, 610],
      [290, 380, 470, 590],
      [360, 420, 480, 310],
      [250, 320, 400, 530],
      [270, 350, 430, 640],
      [310, 400, 500, 720],
    ]),
  },
  pipeline: [
    { key: 'pending_review', label: 'Pending review', value: 32, tone: 'amber' },
    { key: 'active', label: 'Active', value: 312, tone: 'emerald' },
    { key: 'suspended', label: 'Suspended', value: 6, tone: 'rose' },
  ],
  orders: [
    { id: 'EM-10482', vendor: 'Kente House', region: 'Greater Accra', total: 890, status: 'pending' },
    { id: 'EM-10481', vendor: 'Accra Atelier', region: 'Ashanti', total: 2450, status: 'processing' },
    { id: 'EM-10480', vendor: 'Northern Grain Co.', region: 'Northern', total: 320, status: 'shipped' },
    { id: 'EM-10479', vendor: 'Coastal Home', region: 'Central', total: 1560, status: 'delivered' },
    { id: 'EM-10478', vendor: 'Kumasi Crafts', region: 'Ashanti', total: 670, status: 'pending' },
    { id: 'EM-10477', vendor: 'Labadi Lights', region: 'Greater Accra', total: 1180, status: 'delivered' },
  ],
  salesByRegionByYear: {
    2024: regionSalesYear({
      Ahafo: 620000,
      Ashanti: 2140000,
      Bono: 860000,
      'Bono East': 710000,
      Central: 1320000,
      Eastern: 1480000,
      'Greater Accra': 2460000,
      'North East': 540000,
      Northern: 940000,
      Oti: 560000,
      Savannah: 530000,
      'Upper East': 680000,
      'Upper West': 600000,
      Volta: 1020000,
      Western: 1240000,
      'Western North': 780000,
    }),
    2025: regionSalesYear({
      Ahafo: 740000,
      Ashanti: 2580000,
      Bono: 980000,
      'Bono East': 820000,
      Central: 1560000,
      Eastern: 1760000,
      'Greater Accra': 2920000,
      'North East': 640000,
      Northern: 1120000,
      Oti: 660000,
      Savannah: 620000,
      'Upper East': 780000,
      'Upper West': 700000,
      Volta: 1180000,
      Western: 1460000,
      'Western North': 900000,
    }),
    2026: regionSalesYear({
      Ahafo: 860000,
      Ashanti: 2960000,
      Bono: 1120000,
      'Bono East': 940000,
      Central: 1780000,
      Eastern: 2040000,
      'Greater Accra': 3280000,
      'North East': 720000,
      Northern: 1280000,
      Oti: 760000,
      Savannah: 710000,
      'Upper East': 880000,
      'Upper West': 810000,
      Volta: 1360000,
      Western: 1680000,
      'Western North': 1020000,
    }),
  },
}
