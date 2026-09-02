import { useParams } from 'react-router'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CircleDollarSign, ShoppingCart } from 'lucide-react'
import VendorWorkspace from '../components/vendors/VendorWorkspace'
import { getOrderStatusMeta } from '../constants/adminDashboardData'
import { getVendorRecentOrders, getVendorSalesTrend } from '../constants/vendorsData'
import { CHART_AXIS_TICK, CHART_AXIS_TICK_Y } from '../constants/chartTheme'
import { formatCedi, formatCediCompact, formatCount } from '../utils/formatters'

function Tip({ active, payload }) {
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload
  return (
    <div className="rounded-xl border border-slate-100 bg-white/95 px-3.5 py-2.5 font-sans shadow-2xl backdrop-blur-sm">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">{point?.label}</p>
      <p className="text-sm font-bold text-slate-900">{formatCedi(point?.sales)}</p>
    </div>
  )
}

export default function VendorSales() {
  const { vendorId } = useParams()

  return (
    <VendorWorkspace vendorId={vendorId} current="sales" pageTitle="Sales">
      {(vendor) => {
        const trend = getVendorSalesTrend(vendor)
        const orders = getVendorRecentOrders(vendor)
        const total = trend.reduce((sum, point) => sum + point.sales, 0)

        return (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Sales (30d)</p>
                <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-slate-950">{formatCedi(vendor.sales30d)}</p>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                  <CircleDollarSign className="size-3.5" /> Paid order value
                </p>
              </article>
              <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Orders (30d)</p>
                <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-slate-950">{formatCount(vendor.orders30d)}</p>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                  <ShoppingCart className="size-3.5" /> Completed + open
                </p>
              </article>
            </div>

            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Sales trend</h3>
                  <p className="text-xs text-slate-500">Paid value for this store, last seven months</p>
                </div>
                <p className="text-sm font-bold tabular-nums text-slate-950">{formatCediCompact(total)}</p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="vendorSalesFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0284c7" stopOpacity={0.28} />
                        <stop offset="100%" stopColor="#0284c7" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={CHART_AXIS_TICK_Y}
                      axisLine={false}
                      tickLine={false}
                      width={52}
                      tickFormatter={(value) => formatCediCompact(value)}
                    />
                    <Tooltip content={<Tip />} />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#0284c7"
                      strokeWidth={2.2}
                      fill="url(#vendorSalesFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
              <div className="border-b border-slate-100 px-5 py-4">
                <h3 className="text-sm font-bold text-slate-900">Recent orders</h3>
                <p className="text-xs text-slate-500">Latest checkouts attributed to this store</p>
              </div>
              {orders.length === 0 ? (
                <p className="px-5 py-8 text-sm text-slate-500">No orders yet for this account.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-5 py-2.5">Order</th>
                        <th className="px-5 py-2.5">Region</th>
                        <th className="px-5 py-2.5">Total</th>
                        <th className="px-5 py-2.5">Status</th>
                        <th className="px-5 py-2.5">Placed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.map((order) => {
                        const meta = getOrderStatusMeta(order.status)
                        return (
                          <tr key={order.id}>
                            <td className="px-5 py-3 font-semibold tabular-nums text-slate-900">{order.id}</td>
                            <td className="px-5 py-3 text-slate-600">{order.region}</td>
                            <td className="px-5 py-3 font-semibold tabular-nums text-slate-900">{formatCedi(order.total)}</td>
                            <td className="px-5 py-3">
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${meta.badgeClass}`}>
                                {meta.name}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-slate-500">{order.placed}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )
      }}
    </VendorWorkspace>
  )
}
