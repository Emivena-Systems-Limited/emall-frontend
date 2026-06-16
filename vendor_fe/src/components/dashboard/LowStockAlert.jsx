import { Link } from 'react-router'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import {
  DASHBOARD_LOW_STOCK_LIMIT,
  LOW_STOCK_PRODUCTS,
} from '../../constants/lowStockData'
import { EMPTY_STATE_PRESETS } from '../../constants/emptyStates'
import ProductThumbnail from './ProductThumbnail'
import EmptyState from './EmptyState'

function LowStockBadge() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700 ring-1 ring-amber-100">
      <AlertTriangle className="size-3" />
      Low stock
    </span>
  )
}

export default function LowStockAlert({ products = LOW_STOCK_PRODUCTS }) {
  const items = products.slice(0, DASHBOARD_LOW_STOCK_LIMIT)
  const preset = EMPTY_STATE_PRESETS.lowStock

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-lg bg-amber-50 text-amber-700 ring-1 ring-amber-100">
              <AlertTriangle className="size-3.5" />
            </span>
            <h3 className="text-sm font-semibold text-slate-900">Low stock alert</h3>
          </div>
          <p className="mt-1 text-xs text-slate-400">Products that need restocking soon</p>
        </div>
        {items.length > 0 && (
          <Link
            to="/inventory"
            className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-bold text-cyan-700 transition-colors hover:text-cyan-900"
          >
            View all
            <ArrowRight className="size-3.5" />
          </Link>
        )}
      </div>

      {items.length === 0 ? (
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
            {items.map((product) => (
              <li
                key={product.id}
                className="px-5 py-4 md:grid md:grid-cols-[auto_minmax(0,1fr)_auto_auto] md:items-center md:gap-4"
              >
                <div className="flex items-center gap-3 md:contents">
                  <ProductThumbnail src={product.thumbnail} alt={product.name} />

                  <div className="min-w-0 flex-1 md:col-span-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{product.name}</p>
                    <div className="mt-2 flex items-center justify-between gap-3 md:hidden">
                      <p className="text-xs text-slate-500">
                        <span className="font-bold text-amber-700">{product.stock}</span> left
                      </p>
                      <LowStockBadge />
                    </div>
                  </div>
                </div>

                <p className="mt-3 hidden text-right text-sm font-bold text-amber-700 md:mt-0 md:block">
                  {product.stock}
                </p>

                <div className="hidden md:block">
                  <LowStockBadge />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
