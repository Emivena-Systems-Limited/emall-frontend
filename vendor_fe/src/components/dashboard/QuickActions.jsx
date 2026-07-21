import { Link } from 'react-router'
import {
  ArrowRight, BarChart3, Boxes, Package, Settings, ShoppingCart, Tag,
} from 'lucide-react'

const QUICK_ACTIONS = [
  {
    to: '/products',
    icon: Package,
    label: 'Manage products',
    description: 'Add, edit, or restock catalogue items',
    accent: '#0f8f9c',
  },
  {
    to: '/orders',
    icon: ShoppingCart,
    label: 'View orders',
    description: 'Process payments and fulfil shipments',
    accent: '#3b82f6',
  },
  {
    to: '/inventory',
    icon: Boxes,
    label: 'Inventory',
    description: 'Track stock levels and low-inventory alerts',
    accent: '#8b5cf6',
  },
  {
    to: '/promotions',
    icon: Tag,
    label: 'Promotions',
    description: 'Launch discounts and seasonal offers',
    accent: '#f59e0b',
  },
  {
    to: '/analytics',
    icon: BarChart3,
    label: 'Analytics',
    description: 'Review trends and performance insights',
    accent: '#10b981',
  },
  {
    to: '/settings',
    icon: Settings,
    label: 'Store settings',
    description: 'Storefront, shipping, policies & notifications',
    accent: '#64748b',
  },
]

export default function QuickActions() {
  return (
    <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">Quick actions</h3>
        <p className="mt-1 text-xs text-slate-400">Jump straight to the pages you use most</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.to}
              to={action.to}
              className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
            >
              <span
                className="flex size-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-slate-100"
                style={{ background: `${action.accent}14` }}
              >
                <Icon className="size-5" style={{ color: action.accent }} strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{action.label}</p>
                <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
                  {action.description}
                </p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-slate-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-cyan-700" />
            </Link>
          )
        })}
      </div>
    </section>
  )
}
