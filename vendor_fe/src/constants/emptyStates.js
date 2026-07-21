import {
  AlertTriangle,
  Bell,
  HelpCircle,
  LineChart,
  MessageSquare,
  Package,
  Settings,
  ShoppingBag,
  Star,
  Tag,
  UserCog,
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
  reviews: {
    icon: Star,
    title: 'No reviews yet',
    description: 'When customers leave feedback on your products, their reviews will appear here for you to read and respond.',
  },
  reviewsFiltered: {
    icon: Star,
    title: 'No reviews match your filters',
    description: 'Try adjusting your search or filter criteria to find the reviews you are looking for.',
  },
  ratingBreakdown: {
    icon: Star,
    title: 'No ratings to show',
    description: 'Rating distribution will appear once customers start reviewing your products.',
  },
  productInsights: {
    icon: Package,
    title: 'No product insights yet',
    description: 'Top rated and attention-needed products will show here after you receive reviews.',
  },
  messages: {
    icon: MessageSquare,
    title: 'No messages yet',
    description: 'When customers reach out about orders or products, their conversations will appear here.',
  },
  messagesFiltered: {
    icon: MessageSquare,
    title: 'No conversations match your filters',
    description: 'Try a different search term or adjust your filter to find the conversation you need.',
  },
  storeSettings: {
    icon: Settings,
    title: 'Your store profile is not set up yet',
    description: 'Add your store details, branding, and policies so customers know who they are buying from.',
  },
  teamMembers: {
    icon: UserCog,
    title: 'No team members yet',
    description: 'Invite colleagues to help manage orders, products, and customer conversations.',
  },
  teamMembersFiltered: {
    icon: UserCog,
    title: 'No team members match your filters',
    description: 'Try adjusting your search or role filter to find the person you are looking for.',
  },
  supportTickets: {
    icon: HelpCircle,
    title: 'No support tickets yet',
    description: 'When you contact platform support, your tickets and updates will appear here.',
  },
  supportTicketsFiltered: {
    icon: HelpCircle,
    title: 'No tickets match your filters',
    description: 'Try a different status filter or search term to find your support ticket.',
  },
  analytics: {
    icon: LineChart,
    title: 'No analytics data yet',
    description: 'Sales trends, customer insights, and product performance will appear here once you start receiving orders.',
  },
  analyticsChart: {
    icon: LineChart,
    title: 'Not enough data to chart',
    description: 'Charts will populate after your store records sales activity.',
  },
}
