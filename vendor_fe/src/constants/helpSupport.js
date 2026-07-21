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
    question: 'How do I receive payouts from my sales?',
    answer: 'Go to Finance → Payout Account and add your bank details. Payouts are processed weekly once your balance exceeds the minimum threshold. You\'ll receive an email confirmation for each transfer.',
    category: 'payments',
  },
  {
    id: 'faq-2',
    question: 'What happens when a customer requests a return?',
    answer: 'You\'ll receive a notification and can approve or decline the return from the order details page. If approved, the customer ships the item back and you process the refund once received.',
    category: 'orders',
  },
  {
    id: 'faq-3',
    question: 'How do I add team members to my store?',
    answer: 'Navigate to Users & Permissions and click "Invite member". Choose a role (Manager, Staff, or Viewer) and send the invite. They\'ll receive an email to create their account.',
    category: 'account',
  },
  {
    id: 'faq-4',
    question: 'Why is my product not showing on the marketplace?',
    answer: 'Products must be approved and set to "Active" status with available inventory. Check that all required fields are filled and images meet our guidelines. Pending approval products appear in your Products list with a status badge.',
    category: 'technical',
  },
  {
    id: 'faq-5',
    question: 'How are platform fees calculated?',
    answer: 'A commission is applied to each completed sale. The exact rate depends on your seller tier and product category. View the breakdown in Finance → Earnings for each transaction.',
    category: 'payments',
  },
  {
    id: 'faq-6',
    question: 'Can I pause my store temporarily?',
    answer: 'Yes. Contact platform support to request a temporary store pause. While paused, your listings won\'t be visible to customers but your account data is preserved.',
    category: 'policy',
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
