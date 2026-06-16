import {
  AlertTriangle,
  Bell,
  LineChart,
  Package,
  ShoppingBag,
} from 'lucide-react'

export const EMPTY_STATE_PRESETS = {
  orders: {
    icon: ShoppingBag,
    title: 'No recent orders yet',
    description: 'When customers place orders, they will show up here for quick access.',
  },
  sales: {
    icon: LineChart,
    title: 'No sales data available for this period',
    description: 'Try a different date range or check back once sales start coming in.',
  },
  lowStock: {
    icon: AlertTriangle,
    title: 'No low stock products',
    description: 'Great news — all products are above your minimum stock threshold.',
  },
  notifications: {
    icon: Bell,
    title: 'No notifications yet',
    description: 'Updates about orders, stock, and reviews will appear here.',
  },
  products: {
    icon: Package,
    title: 'No products listed yet',
    description: 'Add your first product to start selling. Use admin-defined categories and brands when you create a listing.',
  },
}
