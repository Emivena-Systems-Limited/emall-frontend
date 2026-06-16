import { Link } from 'react-router'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import ProductThumbnail from '../../components/dashboard/ProductThumbnail'
import EmptyState from '../../components/dashboard/EmptyState'
import { LOW_STOCK_PRODUCTS, LOW_STOCK_THRESHOLD } from '../../constants/lowStockData'
import { EMPTY_STATE_PRESETS } from '../../constants/emptyStates'

function LowStockBadge() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700 ring-1 ring-amber-100">
      <AlertTriangle className="size-3" />
      Low stock
    </span>
  )
}

export default function Inventory({ products = LOW_STOCK_PRODUCTS }) {
  const preset = EMPTY_STATE_PRESETS.lowStock

  return (
    <DashboardLayout pageTitle="Inventory">
      <div className="page-enter space-y-5">
        <Link
          to="/dashboard"
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-brand"
        >
          <ArrowLeft className="size-4" />
          Back to dashboard
        </Link>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-lg bg-amber-50 text-amber-700 ring-1 ring-amber-100">
                <AlertTriangle className="size-3.5" />
              </span>
              <h1 className="text-lg font-bold text-slate-950">Low stock items</h1>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Products with {LOW_STOCK_THRESHOLD} units or fewer. Sample data until the inventory API is connected.
            </p>
          </div>

          {products.length === 0 ? (
            <EmptyState
              icon={preset.icon}
              title={preset.title}
              description={preset.description}
            />
          ) : (
            <>
              <div className="hidden grid-cols-[auto_minmax(0,1fr)_auto_auto] gap-4 border-b border-slate-100 px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400 md:grid">
                <span>Product</span>
                <span>Name</span>
                <span className="text-right">Stock</span>
                <span>Status</span>
              </div>

              <ul className="divide-y divide-slate-100">
                {products.map((product) => (
              <li
                key={product.id}
                className="flex items-center gap-4 px-5 py-4 md:grid md:grid-cols-[auto_minmax(0,1fr)_auto_auto] md:gap-4"
              >
                <ProductThumbnail src={product.thumbnail} alt={product.name} />
                <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900 md:col-span-1">
                  {product.name}
                </p>
                <p className="whitespace-nowrap text-sm font-bold text-amber-700 md:text-right">
                  {product.stock}
                </p>
                <LowStockBadge />
              </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </DashboardLayout>
  )
}
