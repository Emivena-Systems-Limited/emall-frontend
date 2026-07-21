import { Link } from 'react-router'
import { Package } from 'lucide-react'
import EmptyState from '../dashboard/EmptyState'

function formatMoney(amount) {
  return `GH₵ ${Number(amount).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function CustomerPurchasedItems({ items }) {
  if (!items?.length) {
    return (
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-bold text-slate-900">Items purchased</h2>
          <p className="mt-0.5 text-sm text-slate-500">Every product this customer has bought from your store</p>
        </div>
        <EmptyState
          icon={Package}
          title="No purchases yet"
          description="Products this customer buys will appear here with quantities and spend totals."
        />
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-bold text-slate-900">Items purchased</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          {items.length} unique product{items.length === 1 ? '' : 's'} across all orders
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              <th className="px-5 py-3">Product</th>
              <th className="px-5 py-3">SKU</th>
              <th className="px-5 py-3">Qty bought</th>
              <th className="px-5 py-3">Total spend</th>
              <th className="px-5 py-3">Orders</th>
              <th className="px-5 py-3">Last purchased</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.productId || item.productName} className="text-sm hover:bg-slate-50/60">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt=""
                        className="size-11 shrink-0 rounded-lg object-cover ring-1 ring-slate-200"
                      />
                    ) : (
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 ring-1 ring-slate-200">
                        <Package className="size-4" />
                      </span>
                    )}
                    <div className="min-w-0">
                      {item.productId ? (
                        <Link
                          to={`/products/${item.productId}/view`}
                          className="font-semibold text-brand hover:underline"
                        >
                          {item.productName}
                        </Link>
                      ) : (
                        <p className="font-semibold text-slate-900">{item.productName}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">{item.sku || '—'}</td>
                <td className="whitespace-nowrap px-5 py-4 font-semibold tabular-nums text-slate-800">{item.totalQuantity}</td>
                <td className="whitespace-nowrap px-5 py-4 font-semibold tabular-nums text-slate-900">{formatMoney(item.totalSpend)}</td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1">
                    {item.orderNumbers.map((num) => (
                      <Link
                        key={num}
                        to={`/orders/${num}`}
                        className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 hover:bg-brand-light hover:text-brand"
                      >
                        {num}
                      </Link>
                    ))}
                  </div>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">{formatDate(item.lastPurchasedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
