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
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Lightbulb,
  Package,
  PieChart as PieChartIcon,
  TrendingUp,
  Users,
} from 'lucide-react'
import EmptyState from '../dashboard/EmptyState'
import { DonutTip } from '../dashboard/ChartTooltips'
import { EMPTY_STATE_PRESETS } from '../../constants/emptyStates'
import { DONUT_CENTER_LABEL, donutCenterValueStyle, CHART_AXIS_TICK, CHART_AXIS_TICK_Y } from '../../constants/chartTheme'
import { formatCurrency } from '../../utils/analyticsUtils'

function ChartShell({ icon: Icon, title, subtitle, children, empty, className = '' }) {
  return (
    <section className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)] ${className}`}>
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-brand-light text-brand ring-1 ring-brand-muted">
            <Icon className="size-3.5" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-slate-900">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
        </div>
      </div>
      {empty ? (
        <EmptyState
          icon={EMPTY_STATE_PRESETS.analyticsChart.icon}
          title={EMPTY_STATE_PRESETS.analyticsChart.title}
          description={EMPTY_STATE_PRESETS.analyticsChart.description}
          compact
        />
      ) : (
        children
      )}
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

export function RevenueOrdersChart({ timeline, hasData }) {
  const total = timeline.reduce((s, d) => s + d.revenue, 0)

  return (
    <ChartShell icon={TrendingUp} title="Revenue & orders" subtitle="Performance over the selected period" empty={!hasData} className="xl:col-span-2">
      <div className="p-5">
        <div className="mb-4">
          <p className="text-2xl font-bold tabular-nums text-slate-950">{formatCurrency(total)}</p>
          <p className="mt-0.5 text-xs text-slate-500">Total revenue in period</p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={timeline} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
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

export function CategoryBreakdownChart({ categories, hasData }) {
  const total = categories.reduce((s, c) => s + c.value, 0)

  return (
    <ChartShell icon={PieChartIcon} title="Sales by category" subtitle="Revenue distribution" empty={!hasData}>
      <div className="flex flex-col p-5">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={categories} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
              {categories.map((c, i) => (
                <Cell key={i} fill={c.color} stroke="#fff" strokeWidth={3} />
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
          {categories.map((c) => (
            <li key={c.name} className="flex items-center justify-between gap-2 text-xs">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="size-2 rounded-full" style={{ background: c.color }} />
                {c.name}
              </span>
              <span className="font-bold tabular-nums text-slate-800">{Math.round((c.value / total) * 100)}%</span>
            </li>
          ))}
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

export function CustomerGrowthChart({ data, hasData }) {
  return (
    <ChartShell icon={Users} title="Customer growth" subtitle="New vs returning customers" empty={!hasData}>
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

export function TrafficSourcesChart({ sources, hasData }) {
  return (
    <ChartShell icon={TrendingUp} title="Traffic sources" subtitle="Where your store visitors come from" empty={!hasData}>
      <div className="space-y-3 p-5">
        {sources.map((source, i) => (
          <div key={source.name}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">{source.name}</span>
              <span className="tabular-nums text-slate-500">{source.percentage}% · {source.visits.toLocaleString()} visits</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${source.percentage}%`,
                  background: ['#c73b2d', '#0f8f9c', '#f97316', '#64748b', '#8b5cf6'][i % 5],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </ChartShell>
  )
}

export function TopProductsTable({ products, hasData }) {
  return (
    <ChartShell icon={Package} title="Top products" subtitle="Best performers by revenue" empty={!hasData}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3">Product</th>
              <th className="px-5 py-3">Units</th>
              <th className="px-5 py-3">Revenue</th>
              <th className="px-5 py-3">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product, index) => {
              const up = product.trend >= 0
              return (
                <tr key={product.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-900">{product.name}</p>
                        <p className="text-[11px] text-slate-400">{product.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 tabular-nums text-slate-700">{product.units}</td>
                  <td className="px-5 py-3.5 font-semibold tabular-nums text-slate-900">{formatCurrency(product.revenue)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${up ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                      {Math.abs(product.trend)}%
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

export function FulfillmentOverview({ stats, hasData }) {
  const total = Object.values(stats).reduce((a, b) => a + b, 0)
  const items = [
    { key: 'fulfilled', label: 'Fulfilled', color: '#059669' },
    { key: 'pending', label: 'Pending', color: '#f97316' },
    { key: 'cancelled', label: 'Cancelled', color: '#64748b' },
    { key: 'returned', label: 'Returned', color: '#e11d48' },
  ]

  return (
    <ChartShell icon={Package} title="Order fulfilment" subtitle="Status breakdown" empty={!hasData}>
      <div className="grid grid-cols-2 gap-3 p-5">
        {items.map(({ key, label, color }) => {
          const value = stats[key] ?? 0
          const pct = total > 0 ? Math.round((value / total) * 100) : 0
          return (
            <div key={key} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-xs font-semibold text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-slate-950">{value}</p>
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

const insightTone = {
  positive: 'border-emerald-100 bg-emerald-50/50',
  warning: 'border-amber-100 bg-amber-50/50',
  neutral: 'border-slate-100 bg-slate-50/50',
}

const insightIcon = {
  positive: ArrowUpRight,
  warning: AlertTriangle,
  neutral: Lightbulb,
}

export function AnalyticsInsights({ insights, hasData }) {
  if (!hasData || !insights.length) return null

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-bold text-slate-900">Insights</h2>
        <p className="mt-0.5 text-sm text-slate-500">Automated highlights from your store data</p>
      </div>
      <div className="grid gap-3 p-5 sm:grid-cols-2">
        {insights.map((item, i) => {
          const Icon = insightIcon[item.type] ?? Lightbulb
          return (
            <article key={i} className={`rounded-xl border p-4 ${insightTone[item.type] ?? insightTone.neutral}`}>
              <div className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-600 ring-1 ring-slate-200">
                  <Icon className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.text}</p>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export function AnalyticsEmptyHero() {
  const preset = EMPTY_STATE_PRESETS.analytics
  return (
    <section className="overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <EmptyState icon={preset.icon} title={preset.title} description={preset.description} />
    </section>
  )
}
