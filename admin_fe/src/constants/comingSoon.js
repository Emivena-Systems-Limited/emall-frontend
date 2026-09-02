import {
  CircleDollarSign,
  Headset,
  Package,
  Settings,
  Shield,
  ShoppingCart,
  Star,
  Tag,
  UserCog,
  Users,
} from 'lucide-react'

export const COMING_SOON = {
  '/products': {
    icon: Package,
    title: 'Catalogue moderation',
    eyebrow: 'Trust',
    description: 'Police listings that break policy, duplicate, or look unsafe for shoppers.',
    capabilities: [
      'Flagged product queue with reason codes',
      'Force-unpublish or restore a listing',
      'Category and brand integrity tools',
    ],
  },
  '/orders': {
    icon: ShoppingCart,
    title: 'Platform orders',
    eyebrow: 'Fulfilment',
    description: 'See every marketplace order, not just one vendor’s slice.',
    capabilities: [
      'Cross-vendor order search and exception filters',
      'Escalations for late dispatch and failed delivery',
      'Refund and replacement oversight',
    ],
  },
  '/customers': {
    icon: Users,
    title: 'Customers',
    eyebrow: 'Demand',
    description: 'Understand shoppers across the network — not inside a single store.',
    capabilities: [
      'Account lookup with order and dispute history',
      'Risk flags for abuse and payment issues',
      'Support notes shared with the help desk',
    ],
  },
  '/finance': {
    icon: CircleDollarSign,
    title: 'Finance',
    eyebrow: 'Treasury',
    description: 'GMV, take rate, payouts, and holds for the whole marketplace.',
    capabilities: [
      'Payout batches and vendor ledger',
      'Holds for disputes and KYC gaps',
      'Settlement exports for finance ops',
    ],
  },
  '/promotions': {
    icon: Tag,
    title: 'Promotions',
    eyebrow: 'Growth',
    description: 'Platform campaigns, flash sales, and coupon policy live here.',
    capabilities: [
      'Create marketplace-wide campaigns',
      'Approve vendor-submitted deals',
      'Guardrails for discount stacking',
    ],
  },
  '/reviews': {
    icon: Star,
    title: 'Trust & reviews',
    eyebrow: 'Quality',
    description: 'Moderate ratings, remove abuse, and protect genuine feedback.',
    capabilities: [
      'Reported review queue',
      'Vendor reply oversight',
      'Trust score signals on listings',
    ],
  },
  '/support': {
    icon: Headset,
    title: 'Support',
    eyebrow: 'Care',
    description: 'Tickets from shoppers and vendors land in one operations inbox.',
    capabilities: [
      'Shared inbox with SLA clocks',
      'Escalate to vendor or finance',
      'Macros for common Ghana delivery issues',
    ],
  },
  '/staff': {
    icon: UserCog,
    title: 'Staff & roles',
    eyebrow: 'Access',
    description: 'Invite EZ-Mall operators and lock tools behind roles.',
    capabilities: [
      'Invite by email with least-privilege roles',
      'Permission matrix for finance, trust, and support',
      'Deactivate a teammate instantly',
    ],
  },
  '/audit': {
    icon: Shield,
    title: 'Audit log',
    eyebrow: 'Compliance',
    description: 'Every sensitive admin action is recorded here.',
    capabilities: [
      'Who approved a vendor, and when',
      'Payout and refund decision trail',
      'Export for internal audit',
    ],
  },
  '/settings': {
    icon: Settings,
    title: 'Platform settings',
    eyebrow: 'Control',
    description: 'Fees, regions, feature flags, and storefront policy.',
    capabilities: [
      'Commission and payout calendars',
      'Supported regions and carriers',
      'Kill-switches for campaigns and checkout',
    ],
  },
}

export function getComingSoon(pathname) {
  return COMING_SOON[pathname] ?? {
    icon: Settings,
    title: 'Coming soon',
    eyebrow: 'Admin',
    description: 'This workspace is on the roadmap. The command center stays available while we wire it.',
    capabilities: ['Navigation is in place', 'Data contracts will land with the API', 'Return to the dashboard to keep operating'],
  }
}
