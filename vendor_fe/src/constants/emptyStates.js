import {
  AlertTriangle,
  Bell,
  LineChart,
  Package,
  ShoppingBag,
  Tag,
  Users,
} from 'lucide-react'

export const EMPTY_STATE_PRESETS = {
  orders: {
    icon: ShoppingBag,
    title: 'No orders yet',
    description: 'When customers place orders, they will appear here for you to track and fulfil.',
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
  customers: {
    icon: Users,
    title: 'No customers yet',
    description: 'When customers purchase from your store, their profiles will appear here.',
  },
  promotions: {
    icon: Tag,
    title: 'No promotions yet',
    description: 'Create your first promotion to boost sales and attract more customers.',
  },
}
