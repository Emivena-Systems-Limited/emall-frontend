export const ADMIN_DEMO = {
  email: 'leo.a@example.org',
  password: 'Admin@123',
  user: {
    full_name: 'Ama Mensah',
    email: 'leo.a@example.org',
    role: 'Super Admin',
    status: 'active',
  },
}

export const ADMIN_DASHBOARD = {
  generatedAt: '2026-08-31T09:40:00+00:00',
  kpis: [
    { key: 'gmv', label: 'GMV (30d)', value: 1842500, format: 'cedi', delta: 12.4, helper: 'Vs previous 30 days' },
    { key: 'vendors', label: 'Live vendors', value: 312, format: 'count', delta: 4.1, helper: 'Approved & selling' },
    { key: 'orders', label: 'Orders today', value: 486, format: 'count', delta: 8.6, helper: 'Completed + pending' },
    { key: 'applications', label: 'Pending KYC', value: 8, format: 'count', delta: -18.2, helper: 'Seller applications', invert: true },
    { key: 'disputes', label: 'Open disputes', value: 11, format: 'count', delta: -6.0, helper: 'Need a decision', invert: true },
    { key: 'takeRate', label: 'Take rate', value: 8.5, format: 'percent', delta: 0.3, helper: 'Marketplace commission' },
  ],
  attention: [
    { id: 'kyc', to: '/vendors/applications', tone: 'urgent', label: 'Vendor applications', count: 8, detail: '3 have waited over 48 hours' },
    { id: 'flags', to: '/products', tone: 'watch', label: 'Flagged listings', count: 3, detail: 'Policy and duplicate reports' },
    { id: 'payouts', to: '/finance', tone: 'watch', label: 'Payout holds', count: 2, detail: 'KYC mismatch on bank details' },
    { id: 'tickets', to: '/support', tone: 'info', label: 'Support tickets', count: 5, detail: '2 approaching SLA' },
  ],
  gmv: [
    { label: 'Mon', gmv: 52000, orders: 118 },
    { label: 'Tue', gmv: 61000, orders: 142 },
    { label: 'Wed', gmv: 57400, orders: 131 },
    { label: 'Thu', gmv: 68800, orders: 156 },
    { label: 'Fri', gmv: 81200, orders: 198 },
    { label: 'Sat', gmv: 94600, orders: 224 },
    { label: 'Sun', gmv: 70300, orders: 167 },
  ],
  pipeline: [
    { key: 'applied', label: 'Applied', value: 24, tone: 'slate' },
    { key: 'review', label: 'In review', value: 8, tone: 'amber' },
    { key: 'approved', label: 'Approved', value: 312, tone: 'emerald' },
    { key: 'suspended', label: 'Suspended', value: 6, tone: 'rose' },
  ],
  orders: [
    { id: 'EM-10482', vendor: 'Kente House', region: 'Greater Accra', total: 890, status: 'Paid' },
    { id: 'EM-10481', vendor: 'Accra Atelier', region: 'Ashanti', total: 2450, status: 'Dispatching' },
    { id: 'EM-10480', vendor: 'Northern Grain Co.', region: 'Northern', total: 320, status: 'Delivered' },
    { id: 'EM-10479', vendor: 'Coastal Home', region: 'Central', total: 1560, status: 'Paid' },
    { id: 'EM-10478', vendor: 'Kumasi Crafts', region: 'Ashanti', total: 670, status: 'Exception' },
    { id: 'EM-10477', vendor: 'Labadi Lights', region: 'Greater Accra', total: 1180, status: 'Delivered' },
  ],
}
