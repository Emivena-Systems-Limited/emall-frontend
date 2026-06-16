import { AlertTriangle, ShoppingBag, Star } from 'lucide-react'

export const NOTIFICATION_TYPES = {
  new_order: {
    label: 'New order received',
    icon: ShoppingBag,
    accent: '#0f8f9c',
    badgeClass: 'bg-sky-50 text-sky-700 ring-sky-100',
  },
  low_stock: {
    label: 'Product low in stock',
    icon: AlertTriangle,
    accent: '#f59e0b',
    badgeClass: 'bg-amber-50 text-amber-700 ring-amber-100',
  },
  customer_review: {
    label: 'Customer review received',
    icon: Star,
    accent: '#8b5cf6',
    badgeClass: 'bg-violet-50 text-violet-700 ring-violet-100',
  },
}

export const VENDOR_NOTIFICATIONS = [
  {
    id: 'notif-001',
    type: 'new_order',
    title: 'New order received',
    message: 'Order ORD-1048 — Wireless Earbuds Pro (GH₵ 490)',
    dateTime: '2026-06-16T14:22:00',
    read: false,
    link: '/orders/ORD-1048',
  },
  {
    id: 'notif-002',
    type: 'low_stock',
    title: 'Product low in stock',
    message: 'Bluetooth Speaker Mini has only 2 units left',
    dateTime: '2026-06-16T11:40:00',
    read: false,
    link: '/inventory',
  },
  {
    id: 'notif-003',
    type: 'customer_review',
    title: 'Customer review received',
    message: 'Ama Darko rated Smart Watch Series 4 — 5 stars',
    dateTime: '2026-06-16T09:15:00',
    read: false,
    link: '/reviews',
  },
  {
    id: 'notif-004',
    type: 'new_order',
    title: 'New order received',
    message: 'Order ORD-1047 — Smart Watch Series 4 (GH₵ 890)',
    dateTime: '2026-06-15T18:05:00',
    read: true,
    link: '/orders/ORD-1047',
  },
  {
    id: 'notif-005',
    type: 'low_stock',
    title: 'Product low in stock',
    message: 'USB-C Hub 7-in-1 has only 5 units left',
    dateTime: '2026-06-15T14:30:00',
    read: true,
    link: '/inventory',
  },
  {
    id: 'notif-006',
    type: 'customer_review',
    title: 'Customer review received',
    message: 'Kwame Asante rated Running Sneakers — 4 stars',
    dateTime: '2026-06-14T16:50:00',
    read: true,
    link: '/reviews',
  },
  {
    id: 'notif-007',
    type: 'new_order',
    title: 'New order received',
    message: 'Order ORD-1046 — Running Sneakers (GH₵ 340)',
    dateTime: '2026-06-14T10:20:00',
    read: true,
    link: '/orders/ORD-1046',
  },
]

export const DASHBOARD_NOTIFICATIONS_LIMIT = 5
