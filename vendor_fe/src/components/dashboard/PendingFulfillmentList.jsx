import { Clock3 } from 'lucide-react'
import { AVATAR_HUE, PENDING_FULFILLMENT } from '../../constants/dashboardData'

export default function PendingFulfillmentList() {
  return (
    <section className="flex flex-col lg:col-span-3 overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-lg bg-amber-50 text-amber-700 ring-1 ring-amber-100">
              <Clock3 className="size-3.5" />
            </span>
            <h3 className="text-sm font-semibold text-slate-900">Pending fulfillment</h3>
          </div>
          <p className="mt-1 text-xs text-slate-400">Orders awaiting processing or dispatch</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700 ring-1 ring-amber-100">
            {PENDING_FULFILLMENT.length} active
          </span>
          <button type="button" className="cursor-pointer text-[11px] font-semibold text-cyan-700 underline-offset-2 transition-colors hover:underline">
            View all
          </button>
        </div>
      </div>

      <div className="hidden grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_auto_auto_auto] gap-3 border-b border-slate-100 px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400 md:grid">
        <span>Order</span>
        <span>Product</span>
        <span className="text-center">Qty</span>
        <span className="text-right">Amount</span>
        <span className="text-right">Waiting</span>
      </div>

      <ul className="divide-y divide-slate-100">
        {PENDING_FULFILLMENT.map((order, i) => {
          const initials = order.customer.split(' ').map((part) => part[0]).join('').slice(0, 2)
          return (
            <li
              key={order.id}
              className="grid gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50/70 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_auto_auto_auto] md:items-center"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className={`flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${AVATAR_HUE[i % AVATAR_HUE.length]}`}>
                  {initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-900">{order.customer}</p>
                  <p className="truncate text-[10px] text-slate-400">{order.id}</p>
                </div>
              </div>

              <p className="min-w-0 truncate text-xs text-slate-600 md:col-auto">{order.product}</p>
              <p className="text-xs font-semibold text-slate-700 md:text-center">{order.qty}</p>
              <p className="whitespace-nowrap text-xs font-bold text-slate-900 md:text-right">
                GH₵ {order.amount.toLocaleString()}
              </p>

              <div className="flex items-center justify-between gap-2 md:justify-end">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-100">
                  <Clock3 className="size-3" />
                  {order.waiting}
                </span>
                <button type="button" className="cursor-pointer rounded-lg bg-cyan-700 px-2.5 py-1 text-[10px] font-semibold text-white transition-colors hover:bg-cyan-800 md:hidden">
                  Fulfill
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
