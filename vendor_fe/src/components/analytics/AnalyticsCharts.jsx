import { Link } from 'react-router'
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
  MapPin,
  Package,
  PieChart as PieChartIcon,
  RefreshCw,
  Truck,
  TrendingUp,
  Users,
} from 'lucide-react'
import EmptyState from '../dashboard/EmptyState'
import { DonutTip } from '../dashboard/ChartTooltips'
import { SkeletonBlock } from '../common/skeleton/CatalogSkeleton'
import { EMPTY_STATE_PRESETS } from '../../constants/emptyStates'
import { DONUT_CENTER_LABEL, donutCenterValueStyle, CHART_AXIS_TICK, CHART_AXIS_TICK_Y } from '../../constants/chartTheme'
import { CATEGORY_COLORS } from '../../constants/analytics'
import { formatCurrency, formatStatCurrency } from '../../utils/analyticsUtils'
import { buildViewProductFromAnalyticsPath } from '../../utils/analyticsNavigation'
import YearDropdown from '../dashboard/YearDropdown'

function FadingSkeletonFill({ variant = 'chart', busy = false }) {
  const items = {
    chart: (
      <>
        <SkeletonBlock className="h-6 w-28" />
        <SkeletonBlock className="h-2.5 w-20" />
        <SkeletonBlock className="h-36 w-full" />
      </>
    ),
    bars: Array.from({ length: 6 }, (_, index) => (
      <div key={index} className="space-y-1">
        <div className="flex items-center justify-between gap-3">
          <SkeletonBlock className="h-2.5 w-24" />
          <SkeletonBlock className="h-2.5 w-12" />
        </div>
        <SkeletonBlock className="h-1.5 w-full rounded-full" />
      </div>
    )),
    rows: Array.from({ length: 6 }, (_, index) => (
      <div key={index} className="flex items-center gap-2.5">
        <SkeletonBlock className="size-6 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1 space-y-1">
          <SkeletonBlock className="h-2.5 w-3/4" />
          <SkeletonBlock className="h-2 w-1/3" />
        </div>
        <SkeletonBlock className="h-2.5 w-10" />
        <SkeletonBlock className="h-2.5 w-14" />
      </div>
    )),
    tiles: (
      <div className="grid grid-cols-2 gap-2.5">
        {Array.from({ length: 4 }, (_, index) => (
          <SkeletonBlock key={index} className="h-16" />
        ))}
      </div>
    ),
  }

  return (
    <div
      className={`relative min-h-0 flex-1 overflow-hidden ${busy ? 'min-h-40' : ''}`}
      role={busy ? 'progressbar' : undefined}
      aria-label={busy ? 'Loading chart' : undefined}
      aria-hidden={!busy}
    >
      <div
        className="absolute inset-0 flex flex-col gap-2.5 px-5 py-4"
        style={{
          WebkitMaskImage: 'linear-gradient(180deg, #000 0%, #000 28%, transparent 100%)',
          maskImage: 'linear-gradient(180deg, #000 0%, #000 28%, transparent 100%)',
        }}
      >
        {items[variant] ?? items.chart}
      </div>
    </div>
  )
}

function ChartError({ message, onRetry, isRetrying }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-5 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-100">
        <AlertTriangle className="size-5" />
      </span>
      <p className="mt-4 text-sm font-semibold text-slate-800">Unable to load chart</p>
      <p className="mt-1 max-w-sm text-xs text-slate-500">
        {message || 'Something went wrong while fetching this report.'}
      </p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          <RefreshCw className={`size-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
          Retry
        </button>
      ) : null}
    </div>
  )
}

function ChartShell({
  icon: Icon,
  title,
  subtitle,
  action,
  children,
  empty,
  loading = false,
  errorMessage = '',
  onRetry,
  isRetrying = false,
  skeleton = 'chart',
  className = '',
}) {
  const fill = <FadingSkeletonFill variant={skeleton} busy={loading} />

  let body = children
  if (loading) body = fill
  else if (errorMessage) body = <ChartError message={errorMessage} onRetry={onRetry} isRetrying={isRetrying} />
  else if (empty) body = fill

  return (
    <section className={`flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)] ${className}`}>
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand ring-1 ring-brand-muted">
            <Icon className="size-3.5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-900">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        {body}
      </div>
    </section>
  )
}

function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-100 bg-white/95 px-3.5 py-2.5 font-sans shadow-2xl backdrop-blur-sm">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-xs font-semibold text-slate-800">
          <span className="size-2 rounded-full" style={{ background: p.color }} />
          {p.name}: {p.dataKey === 'revenue' ? formatCurrency(p.value) : p.value}
        </div>
      ))}
    </div>
  )
}

export function RevenueOrdersChart({
  timeline = [],
  totalRevenue,
  hasData,
  year,
  onYearChange,
  isLoading = false,
  isError = false,
  error = null,
  onRetry,
  isFetching = false,
}) {
  const series = Array.isArray(timeline) ? timeline : []
  const total = totalRevenue != null
    ? Number(totalRevenue) || 0
    : series.reduce((sum, point) => sum + (point.revenue ?? 0), 0)

  return (
    <ChartShell
      icon={TrendingUp}
      title="Revenue & orders"
      subtitle={`Monthly performance in ${year}`}
      empty={!hasData}
      loading={isLoading}
      errorMessage={isError ? (error?.message ?? 'Something went wrong while fetching revenue and orders.') : ''}
      onRetry={onRetry}
      isRetrying={isFetching}
      skeleton="chart"
      className="xl:col-span-2"
      action={<YearDropdown id="analytics-revenue-year" value={year} onChange={onYearChange} />}
    >
      <div className="p-5">
        <div className="mb-4">
          <p className="text-2xl font-bold tabular-nums text-slate-950">{formatCurrency(total)}</p>
          <p className="mt-0.5 text-xs text-slate-500">Total revenue in {year}</p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={series} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c73b2d" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#c73b2d" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 4" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="label" tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" tick={CHART_AXIS_TICK_Y} axisLine={false} tickLine={false} />
            <YAxis yAxisId="right" orientation="right" tick={CHART_AXIS_TICK_Y} axisLine={false} tickLine={false} />
            <Tooltip content={<RevenueTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
            <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke="#c73b2d" fill="url(#revenueGrad)" strokeWidth={2} />
            <Line yAxisId="right" type="monotone" dataKey="orders" name="Orders" stroke="#0f8f9c" strokeWidth={2.5} dot={{ r: 3, fill: '#0f8f9c' }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </ChartShell>
  )
}

export function CategoryBreakdownChart({
  categories = [],
  totalRevenue,
  hasData,
  year,
  onYearChange,
  isLoading = false,
  isError = false,
  error = null,
  onRetry,
  isFetching = false,
}) {
  const slices = Array.isArray(categories) ? categories : []
  const total = totalRevenue != null
    ? Number(totalRevenue) || 0
    : slices.reduce((sum, item) => sum + (item.value ?? item.revenue ?? 0), 0)

  return (
    <ChartShell
      icon={PieChartIcon}
      title="Sales by category"
      subtitle={`Revenue distribution in ${year}`}
      empty={!hasData}
      loading={isLoading}
      errorMessage={isError ? (error?.message ?? 'Something went wrong while fetching sales by category.') : ''}
      onRetry={onRetry}
      isRetrying={isFetching}
      skeleton="bars"
      action={<YearDropdown id="analytics-category-year" value={year} onChange={onYearChange} />}
    >
      <div className="flex flex-col p-5">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={slices} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" nameKey="name" startAngle={90} endAngle={-270}>
              {slices.map((slice, index) => (
                <Cell key={slice.id ?? slice.name ?? index} fill={slice.color} stroke="#fff" strokeWidth={3} />
              ))}
            </Pie>
            <Tooltip content={<DonutTip />} />
            <text x="50%" y="46%" textAnchor="middle" style={DONUT_CENTER_LABEL}>Total</text>
            <text x="50%" y="58%" textAnchor="middle" style={donutCenterValueStyle(18)}>
              {formatCurrency(total)}
            </text>
          </PieChart>
        </ResponsiveContainer>
        <ul className="mt-2 space-y-1.5">
          {slices.map((slice, index) => {
            const share = total > 0 ? Math.round(((slice.value ?? slice.revenue ?? 0) / total) * 100) : 0
            return (
              <li key={slice.id ?? slice.name ?? index} className="flex items-center justify-between gap-2 text-xs">
                <span className="flex min-w-0 items-center gap-2 text-slate-600">
                  <span className="size-2 shrink-0 rounded-full" style={{ background: slice.color }} />
                  <span className="truncate">{slice.name}</span>
                </span>
                <span className="shrink-0 font-bold tabular-nums text-slate-800">{share}%</span>
              </li>
            )
          })}
        </ul>
      </div>
    </ChartShell>
  )
}

function CustomerGrowthTip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-100 bg-white/95 px-3.5 py-2.5 font-sans shadow-2xl backdrop-blur-sm">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-xs font-semibold text-slate-800">
          <span className="size-2 rounded-full" style={{ background: p.fill }} />
          {p.value} {p.name.toLowerCase()}
        </div>
      ))}
    </div>
  )
}

export function CustomerGrowthChart({
  data,
  hasData,
  year,
  onYearChange,
  isLoading = false,
  isError = false,
  error = null,
  onRetry,
  isFetching = false,
}) {
  return (
    <ChartShell
      icon={Users}
      title="Customer growth"
      subtitle={`New vs returning in ${year}`}
      empty={!hasData}
      loading={isLoading}
      errorMessage={isError ? (error?.message ?? 'Something went wrong while fetching customer growth.') : ''}
      onRetry={onRetry}
      isRetrying={isFetching}
      skeleton="chart"
      action={<YearDropdown id="analytics-customer-year" value={year} onChange={onYearChange} />}
    >
      <div className="p-5">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 4" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="label" tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} />
            <YAxis tick={CHART_AXIS_TICK_Y} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomerGrowthTip />} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            <Bar dataKey="newCustomers" name="New" fill="#c73b2d" radius={[4, 4, 0, 0]} />
            <Bar dataKey="returning" name="Returning" fill="#0f8f9c" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartShell>
  )
}

export function SalesByRegionChart({
  regions = [],
  totalRevenue,
  hasData,
  year,
  onYearChange,
  isLoading = false,
  isError = false,
  error = null,
  onRetry,
  isFetching = false,
}) {
  const rows = Array.isArray(regions) ? regions : []
  const total = totalRevenue != null
    ? Number(totalRevenue) || 0
    : rows.reduce((sum, region) => sum + (region.revenue ?? 0), 0)

  return (
    <ChartShell
      icon={MapPin}
      title="Sales by region"
      subtitle={`Where orders shipped in ${year}`}
      empty={!hasData}
      loading={isLoading}
      errorMessage={isError ? (error?.message ?? 'Something went wrong while fetching sales by region.') : ''}
      onRetry={onRetry}
      isRetrying={isFetching}
      skeleton="bars"
      action={<YearDropdown id="analytics-region-year" value={year} onChange={onYearChange} />}
    >
      <div className="space-y-3 p-5">
        {rows.map((region, index) => {
          const percentage = total > 0 ? (region.revenue / total) * 100 : 0
          return (
            <div key={region.id ?? region.name ?? index}>
              <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                <span className="min-w-0 truncate font-semibold text-slate-700">{region.name}</span>
                <span className="shrink-0 whitespace-nowrap tabular-nums text-slate-500">
                  {percentage.toFixed(1)}% · {formatStatCurrency(region.revenue)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${percentage}%`,
                    background: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </ChartShell>
  )
}

export function TopProductsTable({
  products = [],
  hasData,
  year,
  onYearChange,
  isLoading = false,
  isError = false,
  error = null,
  onRetry,
  isFetching = false,
}) {
  const rows = Array.isArray(products) ? products : []

  return (
    <ChartShell
      icon={Package}
      title="Top products"
      subtitle={`Best performers in ${year}`}
      empty={!hasData}
      loading={isLoading}
      errorMessage={isError ? (error?.message ?? 'Something went wrong while fetching top products.') : ''}
      onRetry={onRetry}
      isRetrying={isFetching}
      skeleton="rows"
      action={<YearDropdown id="analytics-products-year" value={year} onChange={onYearChange} />}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] table-fixed text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3">Product</th>
              <th className="w-16 px-5 py-3">Units</th>
              <th className="w-28 px-5 py-3">Revenue</th>
              <th className="w-20 px-5 py-3">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((product, index) => {
              const trend = Number(product.trend) || 0
              const up = trend >= 0
              return (
                <tr key={product.id ?? `${product.name}-${index}`} className="hover:bg-slate-50/60">
                  <td className="max-w-0 px-5 py-3.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        {product.id ? (
                          <Link
                            to={buildViewProductFromAnalyticsPath(product.id)}
                            title={product.name}
                            className="block min-w-0 cursor-pointer transition-colors hover:text-brand"
                          >
                            <p className="truncate font-semibold text-slate-900">{product.name}</p>
                            <p className="truncate text-[11px] font-normal text-slate-400">{product.category}</p>
                          </Link>
                        ) : (
                          <>
                            <p className="truncate font-semibold text-slate-900" title={product.name}>{product.name}</p>
                            <p className="truncate text-[11px] text-slate-400" title={product.category}>{product.category}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 tabular-nums text-slate-700">{product.units}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap font-semibold tabular-nums text-slate-900">{formatCurrency(product.revenue)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-0.5 whitespace-nowrap text-xs font-bold ${up ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                      {Math.abs(trend)}%
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </ChartShell>
  )
}

export function FulfillmentOverview({
  stats = {},
  total: totalCount,
  hasData,
  year,
  onYearChange,
  isLoading = false,
  isError = false,
  error = null,
  onRetry,
  isFetching = false,
}) {
  const items = [
    { key: 'fulfilled', label: 'Fulfilled', color: '#059669' },
    { key: 'pending', label: 'Pending', color: '#f97316' },
    { key: 'cancelled', label: 'Cancelled', color: '#64748b' },
    { key: 'returned', label: 'Returned', color: '#e11d48' },
  ]
  const summed = items.reduce((sum, item) => sum + (Number(stats[item.key]) || 0), 0)
  const total = totalCount != null ? Number(totalCount) || 0 : summed

  return (
    <ChartShell
      icon={Truck}
      title="Order fulfilment"
      subtitle={`Status breakdown in ${year}`}
      empty={!hasData}
      loading={isLoading}
      errorMessage={isError ? (error?.message ?? 'Something went wrong while fetching order fulfilment.') : ''}
      onRetry={onRetry}
      isRetrying={isFetching}
      skeleton="tiles"
      action={<YearDropdown id="analytics-fulfillment-year" value={year} onChange={onYearChange} />}
    >
      <div className="grid grid-cols-2 gap-3 p-5">
        {items.map(({ key, label, color }) => {
          const value = stats[key] ?? 0
          const pct = total > 0 ? Math.round((value / total) * 100) : 0
          return (
            <div key={key} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-xs font-semibold text-slate-500">{label}</p>
              <p className="mt-1 whitespace-nowrap text-2xl font-bold tabular-nums text-slate-950">{value}</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
              </div>
              <p className="mt-1 text-[10px] font-medium text-slate-400">{pct}% of orders</p>
            </div>
          )
        })}
      </div>
    </ChartShell>
  )
}

export function AnalyticsEmptyHero({ title, description }) {
  const preset = EMPTY_STATE_PRESETS.analytics
  return (
    <section className="overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <EmptyState
        icon={preset.icon}
        title={title || preset.title}
        description={description || preset.description}
      />
    </section>
  )
}
