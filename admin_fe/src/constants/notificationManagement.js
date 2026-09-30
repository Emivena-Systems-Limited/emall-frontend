export const NOTIFICATION_TABS = [
  { key: 'all', label: 'All Notifications' },
  { key: 'create', label: 'Create Notification' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'templates', label: 'Templates' },
]

export const NOTIFICATION_TYPES = ['Order', 'Payment', 'Promotion', 'Account', 'System']
export const NOTIFICATION_CHANNELS = ['In-App', 'Email', 'SMS']
export const NOTIFICATION_AUDIENCES = ['All Users', 'All Vendors', 'All Customers', 'Specific Vendors', 'Specific Customers']

export const AUDIENCE_OPTIONS = {
  'Specific Vendors': [
    { id: 'vendor-1', name: 'Emimvena Logistics Stores', detail: 'vendor@emimvena.com' },
    { id: 'vendor-2', name: 'Ponytailed gh', detail: 'support@ponytailed.com' },
    { id: 'vendor-3', name: 'Minimax Trading Company', detail: 'hello@minimax.com' },
  ],
  'Specific Customers': [
    { id: 'customer-1', name: 'Kennedy Dzigbenyo', detail: 'dzigbenyokennedy@gmail.com' },
    { id: 'customer-2', name: 'Emma Andoh', detail: 'sengaemmaandoh@gmail.com' },
    { id: 'customer-3', name: 'Daniel Kay', detail: 'ansongdaniel720@gmail.com' },
    { id: 'customer-4', name: 'Courage Ahorttor', detail: 'ahorttorc@gmail.com' },
  ],
}

export const INITIAL_MANAGED_NOTIFICATIONS = [
  { id: 'NTF-24018', title: 'Order delivery update', message: 'Your order is on its way and will arrive today.', audience: 'All Customers', recipients: 1248, type: 'Order', status: 'Delivered', channels: ['In-App', 'Email'], date: '2026-09-28T08:30:00', deliveredRate: 98 },
  { id: 'NTF-24017', title: 'Weekend marketplace offer', message: 'Save up to 20% on selected marketplace essentials this weekend.', audience: 'All Users', recipients: 3890, type: 'Promotion', status: 'Scheduled', channels: ['In-App', 'Email', 'SMS'], date: '2026-10-02T09:00:00', deliveredRate: 0 },
  { id: 'NTF-24016', title: 'Payout processing notice', message: 'Vendor payouts will be processed within the next business day.', audience: 'All Vendors', recipients: 86, type: 'Payment', status: 'Delivered', channels: ['In-App', 'Email'], date: '2026-09-27T14:15:00', deliveredRate: 100 },
  { id: 'NTF-24015', title: 'Account security reminder', message: 'Review your account details and keep your password secure.', audience: 'All Users', recipients: 3890, type: 'Account', status: 'Failed', channels: ['Email'], date: '2026-09-26T11:45:00', deliveredRate: 72 },
  { id: 'NTF-24014', title: 'Scheduled maintenance', message: 'The marketplace will be briefly unavailable during maintenance.', audience: 'All Users', recipients: 3890, type: 'System', status: 'Scheduled', channels: ['In-App'], date: '2026-10-05T23:00:00', deliveredRate: 0 },
]

export const INITIAL_NOTIFICATION_TEMPLATES = [
  { id: 'TPL-1', name: 'Order status update', type: 'Order', title: 'Your order has been updated', message: 'There is a new update for your recent order.' },
  { id: 'TPL-2', name: 'Marketplace promotion', type: 'Promotion', title: 'A special offer for you', message: 'Explore limited-time offers selected for our marketplace community.' },
  { id: 'TPL-3', name: 'Account notice', type: 'Account', title: 'Important account notice', message: 'Please review this important update about your account.' },
]
