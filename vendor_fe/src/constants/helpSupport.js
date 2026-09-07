export const TICKET_STATUS = {
  open: { label: 'Open', tone: 'sky' },
  in_progress: { label: 'In progress', tone: 'amber' },
  awaiting_reply: { label: 'Awaiting your reply', tone: 'violet' },
  resolved: { label: 'Resolved', tone: 'emerald' },
  closed: { label: 'Closed', tone: 'slate' },
}

export const TICKET_CATEGORIES = {
  account: 'Account & billing',
  orders: 'Orders & fulfilment',
  payments: 'Payments & payouts',
  technical: 'Technical issue',
  policy: 'Policy & compliance',
  other: 'Other',
}

export const TICKET_PRIORITY = {
  low: { label: 'Low', tone: 'slate' },
  normal: { label: 'Normal', tone: 'sky' },
  high: { label: 'High', tone: 'amber' },
  urgent: { label: 'Urgent', tone: 'rose' },
}

export const HELP_TICKETS_PAGE_SIZE = 8

export const PLATFORM_CONTACT = {
  email: 'vendor-support@e-mall.com',
  phone: '+233 30 000 0000',
  hours: 'Mon–Fri 8:00 AM – 6:00 PM GMT',
  responseTime: 'Within 24 business hours',
}

export const PLATFORM_FAQ = [
  {
    id: 'faq-1',
    question: 'How do I add or update a product?',
    answer: 'Go to Products in your dashboard to add a new product or edit an existing product\'s details, price, images and stock.',
    category: 'technical',
  },
  {
    id: 'faq-2',
    question: 'How do I manage and process customer orders?',
    answer: 'Go to Orders to view new orders, check order details and update the order status as it is processed and dispatched.',
    category: 'orders',
  },
]

export const QUICK_HELP_LINKS = [
  {
    id: 'getting-started',
    label: 'Getting started guide',
    description: 'Set up your store in 5 steps',
    icon: 'rocket',
    action: 'guide',
  },
  {
    id: 'orders',
    label: 'Managing orders',
    description: 'Fulfilment workflow explained',
    icon: 'package',
    action: 'route',
    to: '/orders',
  },
  {
    id: 'payments',
    label: 'Payments & payouts',
    description: 'When and how you get paid',
    icon: 'wallet',
    action: 'route',
    to: '/finance',
  },
  {
    id: 'reviews',
    label: 'Reviews & reputation',
    description: 'Moderate customer feedback',
    icon: 'star',
    action: 'route',
    to: '/reviews',
  },
]

export const GETTING_STARTED_STEPS = [
  {
    step: 1,
    title: 'Complete your store settings',
    description: 'Add your store name, contact details, and branding under Store Settings so customers trust your shop.',
    link: '/settings',
    linkLabel: 'Go to Store Settings',
  },
  {
    step: 2,
    title: 'List your first products',
    description: 'Create product listings with clear photos, accurate pricing, and inventory counts.',
    link: '/products/new',
    linkLabel: 'Add a product',
  },
  {
    step: 3,
    title: 'Configure shipping & policies',
    description: 'Set delivery fees, regions you serve, and your return policy before orders start coming in.',
    link: '/settings',
    linkLabel: 'Update settings',
  },
  {
    step: 4,
    title: 'Process orders promptly',
    description: 'Monitor new orders, update fulfilment status, and keep customers informed at every step.',
    link: '/orders',
    linkLabel: 'View orders',
  },
  {
    step: 5,
    title: 'Track performance & payouts',
    description: 'Use Analytics and Finance to monitor sales trends and manage your payout account.',
    link: '/analytics',
    linkLabel: 'Open analytics',
  },
]
