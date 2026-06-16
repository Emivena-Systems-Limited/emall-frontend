export const ORDER_STATUSES = {
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 ring-amber-100' },
  processing: { label: 'Processing', className: 'bg-sky-50 text-sky-700 ring-sky-100' },
  shipped: { label: 'Shipped', className: 'bg-violet-50 text-violet-700 ring-violet-100' },
  delivered: { label: 'Delivered', className: 'bg-emerald-50 text-emerald-700 ring-emerald-100' },
  cancelled: { label: 'Cancelled', className: 'bg-rose-50 text-rose-700 ring-rose-100' },
}

export const RECENT_ORDERS = [
  {
    id: 'ORD-1048',
    productName: 'Wireless Earbuds Pro',
    thumbnail: 'https://images.unsplash.com/photo-1590658268037-6bf3f7f2b8fd?w=120&h=120&fit=crop',
    dateTime: '2026-06-16T14:22:00',
    status: 'pending',
    amount: 490,
  },
  {
    id: 'ORD-1047',
    productName: 'Smart Watch Series 4',
    thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&h=120&fit=crop',
    dateTime: '2026-06-16T11:05:00',
    status: 'processing',
    amount: 890,
  },
  {
    id: 'ORD-1046',
    productName: 'Running Sneakers',
    thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&h=120&fit=crop',
    dateTime: '2026-06-15T18:40:00',
    status: 'shipped',
    amount: 340,
  },
  {
    id: 'ORD-1045',
    productName: 'Portable Blender',
    thumbnail: 'https://images.unsplash.com/photo-1570222094114-792a308585bc?w=120&h=120&fit=crop',
    dateTime: '2026-06-15T09:15:00',
    status: 'delivered',
    amount: 360,
  },
  {
    id: 'ORD-1044',
    productName: 'Desk LED Lamp',
    thumbnail: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=120&h=120&fit=crop',
    dateTime: '2026-06-14T16:30:00',
    status: 'delivered',
    amount: 240,
  },
  {
    id: 'ORD-1043',
    productName: 'USB-C Hub 7-in-1',
    thumbnail: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=120&h=120&fit=crop',
    dateTime: '2026-06-13T08:50:00',
    status: 'cancelled',
    amount: 185,
  },
]

export function getOrderById(orderId) {
  return RECENT_ORDERS.find((order) => order.id === orderId) ?? null
}
