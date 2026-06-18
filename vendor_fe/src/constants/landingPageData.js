import {
  BadgeDollarSign,
  Box,
  CheckCircle2,
  Megaphone,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react'

export const landingBenefits = [
  {
    icon: Users,
    title: 'Reach more customers',
    description: 'Connect your products with shoppers across Ghana from one professional seller account.',
  },
  {
    icon: TrendingUp,
    title: 'Grow your business',
    description: 'Use simple tools for listings, orders, inventory, and daily selling operations.',
  },
  {
    icon: ShieldCheck,
    title: 'Trusted & secure platform',
    description: 'Sell with protected account access, secure workflows, and reliable vendor support.',
  },
  {
    icon: BadgeDollarSign,
    title: 'Increase your sales',
    description: 'Promote your products, improve visibility, and turn more visits into paid orders.',
  },
]

export const landingSteps = [
  {
    icon: CheckCircle2,
    title: 'Register',
    description: 'Create your seller account in just a few minutes.',
  },
  {
    icon: Box,
    title: 'List your products',
    description: 'Add your product listings, photos, prices, and details.',
  },
  {
    icon: Megaphone,
    title: 'Reach customers',
    description: 'Customers can discover and buy your products.',
  },
  {
    icon: Wallet,
    title: 'Get paid',
    description: 'Earn money and grow your business.',
  },
]

export const landingFooterGroups = [
  {
    title: 'Platform',
    links: [
      { label: 'Benefits', href: '#benefits' },
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'FAQ', href: '#faq' },
    ],
  },
  {
    title: 'Get started',
    links: [
      { label: 'Create an account', href: '/signup' },
      { label: 'Login', href: '/login' },
      { label: 'Verify account', href: '/verify-account' },
    ],
  },
  {
    title: 'Help & support',
    links: [
      { label: 'Account health', href: '/dashboard' },
      { label: 'Contact us', href: '#faq' },
    ],
  },
]

export const landingFaqItems = [
  {
    question: 'How do I start selling?',
    answer: 'Register your seller account, verify it, then list your first products.',
  },
  {
    question: 'Can I manage orders online?',
    answer: 'Yes. The vendor dashboard helps you manage products, orders, inventory, and notifications.',
  },
  {
    question: 'Where can I get support?',
    answer: 'Seller support is available from the help and support links in the vendor portal.',
  },
]
