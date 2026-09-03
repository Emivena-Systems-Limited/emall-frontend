import { useMemo, useState } from 'react'
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
import { AlertTriangle, CircleDollarSign, RefreshCw, ShoppingCart } from 'lucide-react'
import DashboardReveal from '../components/dashboard/DashboardReveal'
import EmptyState from '../components/dashboard/EmptyState'
import OrderPagination from '../components/orders/OrderPagination'
import VendorCatalogOrderTable, { VendorCatalogOrderTableSkeleton } from '../components/orders/VendorCatalogOrderTable'
import VendorWorkspace from '../components/vendors/VendorWorkspace'
import { CHART_AXIS_TICK, CHART_AXIS_TICK_Y } from '../constants/chartTheme'
import {
  useAdminVendorOrderRoster,
  useAdminVendorOrderSnapshot,
} from '../hooks/useAdminVendorOrders'
import { formatCedi, formatCediCompact, formatCount } from '../utils/formatters'
import { parseApiError } from '../utils/parseApiError'
import {
  buildVendorSalesTrend,
  computeVendorSalesSummary,
} from '../utils/vendorOrderAnalytics'

function ChartTip({ active, payload }) {
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload
  return (
    <div className="rounded-xl border border-slate-100 bg-white/95 px-3.5 py-2.5 font-sans shadow-2xl backdrop-blur-sm">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">{point?.label}</p>
      <p className="text-sm font-bold text-slate-900">{formatCedi(point?.sales)}</p>
    </div>
  )
}

function SalesSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading store sales">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="skeleton-shimmer h-28 rounded-2xl" />
        <div className="skeleton-shimmer h-28 rounded-2xl" />
      </div>
      <div className="skeleton-shimmer h-72 rounded-2xl" />
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
        <VendorCatalogOrderTableSkeleton />
      </section>
    </div>
  )
}

function resolveSummaryMetrics(vendor, snapshotOrders) {
  const computed = computeVendorSalesSummary(snapshotOrders)

  return {
    sales30d: computed.salesTotal,
    orders30d: computed.orderCount > 0
      ? computed.orderCount
      : (vendor?.orders30d != null ? Number(vendor.orders30d) : 0),
  }
}

export default function VendorSales() {
  const { vendorId } = useParams()
  const [page, setPage] = useState(1)

  const {
    orders,
    pagination,
    isLoading: rosterLoading,
    isFetching: rosterFetching,
    isError: rosterError,
    error: rosterLoadError,
    refetch: refetchRoster,
  } = useAdminVendorOrderRoster(vendorId, page)

  const {
    orders: snapshotOrders,
    isLoading: snapshotLoading,
    isError: snapshotError,
    error: snapshotLoadError,
    refetch: refetchSnapshot,
  } = useAdminVendorOrderSnapshot(vendorId)

  const isLoading = rosterLoading || snapshotLoading
  const isError = rosterError || snapshotError
  const loadError = rosterLoadError || snapshotLoadError

  const trend = useMemo(
    () => buildVendorSalesTrend(snapshotOrders, { months: 7 }),
    [snapshotOrders],
  )
  const trendTotal = useMemo(
    () => trend.reduce((sum, point) => sum + point.sales, 0),
    [trend],
  )

  const refetchAll = () => {
    refetchRoster()
    refetchSnapshot()
  }

  return (
    <VendorWorkspace vendorId={vendorId} current="sales" pageTitle="Sales">
      {(vendor) => {
        if (isLoading) return <SalesSkeleton />

        if (isError) {
          return (
            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
              <EmptyState
                icon={AlertTriangle}
                title="Could not load store sales"
                description={parseApiError(loadError, 'Vendor order history is unavailable right now.').message}
                action={(
                  <button
                    type="button"
                    onClick={refetchAll}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                  >
                    <RefreshCw className="size-4" />
                    Try again
                  </button>
                )}
              />
            </section>
          )
        }

        const { sales30d, orders30d } = resolveSummaryMetrics(vendor, snapshotOrders)

        return (
          <div className="space-y-5">
            <DashboardReveal index={0}>
              <div className="grid gap-3 sm:grid-cols-2">
                <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Total sales</p>
                  <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-slate-950">{formatCedi(sales30d)}</p>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                    <CircleDollarSign className="size-3.5" />
                    Paid order value
                  </p>
                </article>
                <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Total orders</p>
                  <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-slate-950">{formatCount(orders30d)}</p>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                    <ShoppingCart className="size-3.5" />
                    Completed + open
                  </p>
                </article>
              </div>
            </DashboardReveal>

            <DashboardReveal index={1}>
              <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Sales trend</h3>
                    <p className="text-xs text-slate-500">Paid value for this store, last seven months</p>
                  </div>
                  <p className="text-sm font-bold tabular-nums text-slate-950">{formatCediCompact(trendTotal)}</p>
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
                      <Tooltip content={<ChartTip />} />
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
            </DashboardReveal>

            <DashboardReveal index={2}>
              <div className="space-y-3">
                <div className="flex flex-wrap items-end justify-between gap-3 px-1">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Recent orders</h3>
                    <p className="text-xs text-slate-500">Latest checkouts attributed to this store</p>
                  </div>
                  {rosterFetching ? (
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Refreshing…</span>
                  ) : null}
                </div>
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
                  <VendorCatalogOrderTable orders={orders} />
                  <OrderPagination
                    page={pagination.page}
                    pageCount={pagination.lastPage}
                    totalItems={pagination.total}
                    startIndex={pagination.from}
                    endIndex={pagination.to}
                    onPageChange={setPage}
                  />
                </section>
              </div>
            </DashboardReveal>
          </div>
        )
      }}
    </VendorWorkspace>
  )
}
