import { ADMIN_DASHBOARD } from '../../constants/adminDashboardData'
import { formatCedi } from '../../utils/formatters'

const STATUS = {
  Paid: 'bg-sky-50 text-sky-800 ring-sky-200',
  Dispatching: 'bg-amber-50 text-amber-800 ring-amber-200',
  Delivered: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  Exception: 'bg-rose-50 text-rose-800 ring-rose-200',
}

export default function LiveOrdersFeed() {
  return (
    <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Live orders</h2>
          <p className="text-xs text-slate-500">Latest marketplace checkouts</p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
          <span className="size-1.5 rounded-full bg-emerald-500 pulse-live" />
          Streaming preview
        </span>
      </div>
      <div className="flex-1 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-2.5">Order</th>
              <th className="px-5 py-2.5">Vendor</th>
              <th className="px-5 py-2.5">Region</th>
              <th className="px-5 py-2.5">Total</th>
              <th className="px-5 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ADMIN_DASHBOARD.orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50/70">
                <td className="px-5 py-3 font-semibold tabular-nums text-slate-900">{order.id}</td>
                <td className="px-5 py-3 text-slate-700">{order.vendor}</td>
                <td className="px-5 py-3 text-slate-500">{order.region}</td>
                <td className="px-5 py-3 font-semibold tabular-nums text-slate-900">{formatCedi(order.total)}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${STATUS[order.status]}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
