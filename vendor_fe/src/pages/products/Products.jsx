import { Link } from 'react-router'
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  PackagePlus,
} from 'lucide-react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import EmptyState from '../../components/dashboard/EmptyState'
import { EMPTY_STATE_PRESETS } from '../../constants/emptyStates'

const productStats = [
  { label: 'Listed products', value: '0', helper: 'Add your first product', icon: Boxes },
  { label: 'Active listings', value: '0', helper: 'None live yet', icon: CheckCircle2 },
  { label: 'Low stock', value: '0', helper: 'No alerts', icon: AlertTriangle },
]

export default function Products({ products = [] }) {
  const preset = EMPTY_STATE_PRESETS.products
  const hasProducts = products.length > 0

  return (
    <DashboardLayout pageTitle="Products">
      <div className="page-enter space-y-5">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
          <div className="relative border-b border-slate-100 px-5 py-6 sm:px-6">
            <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-linear-to-l from-brand-light to-transparent sm:block" />
            <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Product catalogue</p>
                <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Manage products with clean listing data
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                  Add products with the right category, brand, images, pricing, and product details so customers can find and trust your listings.
                </p>
              </div>
              <Link
                to="/products/new"
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(199,59,45,0.24)] transition-colors hover:bg-brand-hover"
              >
                <PackagePlus className="size-4" />
                Add product
              </Link>
            </div>
          </div>

          <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-6">
            {productStats.map((stat) => {
              const Icon = stat.icon
              return (
                <article key={stat.label} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-white text-cyan-700 ring-1 ring-slate-200">
                      <Icon className="size-5" strokeWidth={2} />
                    </span>
                    <ArrowRight className="size-4 text-slate-300" />
                  </div>
                  <p className="font-sans text-2xl font-bold text-slate-950">{stat.value}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{stat.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{stat.helper}</p>
                </article>
              )
            })}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-bold text-slate-950">Product listings</h2>
            <p className="mt-1 text-xs text-slate-500">
              Your catalogue will appear here once products are added.
            </p>
          </div>

          {!hasProducts ? (
            <EmptyState
              icon={preset.icon}
              title={preset.title}
              description={preset.description}
              action={(
                <Link
                  to="/products/new"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-brand-hover"
                >
                  <PackagePlus className="size-4" />
                  Add your first product
                </Link>
              )}
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {products.map((product) => (
                <li key={product.id} className="px-5 py-4">
                  <p className="font-bold text-slate-900">{product.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{product.sku}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </DashboardLayout>
  )
}
