import { Link } from 'react-router'
import { Heart, Package } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import EmptyState from '../dashboard/EmptyState'
import { WISHLIST_DASHBOARD_TOP_LIMIT } from '../../constants/wishlistAnalytics'
import { CHART_AXIS_TICK, CHART_AXIS_TICK_Y } from '../../constants/chartTheme'
import { formatCount } from '../../utils/formatters'

const LEADER_FILL = '#c73b2d'
const REST_FILL = '#0f172a'
const NAME_TICK_MAX = 18

function savesLabel(count) {
  return count === 1 ? '1 save' : `${formatCount(count)} saves`
}

function shoppersLabel(count) {
  return count === 1 ? '1 shopper' : `${formatCount(count)} shoppers`
}

function truncateName(value) {
  const text = String(value || '')
  if (text.length <= NAME_TICK_MAX) return text
  return `${text.slice(0, NAME_TICK_MAX - 1)}…`
}

function toChartRows(products) {
  return products.map((row, index) => ({
    ...row,
    rank: index + 1,
    fill: index === 0 ? LEADER_FILL : REST_FILL,
  }))
}

function Tip({ active, payload }) {
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload
  if (!point) return null

  return (
    <div className="rounded-xl border border-slate-100 bg-white/95 px-3.5 py-2.5 font-sans shadow-2xl backdrop-blur-sm">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        #{point.rank}
      </p>
      <p className="max-w-56 text-sm font-bold leading-snug text-slate-900">{point.productName}</p>
      <p className="mt-1 text-xs text-slate-500">
        {savesLabel(point.saves)}
        {' · '}
        {shoppersLabel(point.shoppers)}
      </p>
    </div>
  )
}

function RankingChart({ rows }) {
  const height = Math.max(220, rows.length * 42)

  return (
    <div className="w-full px-2 pb-4 pt-3 sm:px-4" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={rows}
          margin={{ top: 4, right: 36, left: 4, bottom: 0 }}
          barCategoryGap="22%"
        >
          <CartesianGrid strokeDasharray="3 4" stroke="#f1f5f9" horizontal={false} />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={CHART_AXIS_TICK}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => formatCount(value)}
          />
          <YAxis
            type="category"
            dataKey="productName"
            width={118}
            interval={0}
            reversed
            tick={CHART_AXIS_TICK_Y}
            tickFormatter={truncateName}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<Tip />} cursor={{ fill: '#f8fafc' }} />
          <Bar dataKey="saves" name="Saves" maxBarSize={18} radius={[0, 6, 6, 0]}>
            {rows.map((row) => (
              <Cell key={row.id} fill={row.fill} />
            ))}
            <LabelList
              dataKey="saves"
              position="right"
              formatter={(value) => formatCount(value)}
              style={{ fill: '#64748b', fontSize: 10, fontWeight: 600, fontFamily: '"Onest", sans-serif' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function WishlistTopProducts({
  products = [],
  isLoading = false,
  isError = false,
  onRetry,
  compact = false,
}) {
  const rows = toChartRows(compact ? products.slice(0, WISHLIST_DASHBOARD_TOP_LIMIT) : products)

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Most saved</h2>
          <p className="text-xs text-slate-500">Listings shoppers heart the most</p>
        </div>
        {compact ? (
          <Link
            to="/wishlists"
            className="text-xs font-bold text-brand transition-colors hover:text-brand-hover"
          >
            View all
          </Link>
        ) : null}
      </div>

      {isLoading ? (
        <div className="flex-1 px-5 py-4" aria-busy="true" aria-label="Loading most saved listings">
          <div className="skeleton-shimmer h-52 w-full rounded-xl" />
        </div>
      ) : isError ? (
        <EmptyState
          compact
          icon={Heart}
          title="Could not load rankings"
          description="Most saved listings are unavailable right now."
          action={onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="cursor-pointer rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Try again
            </button>
          ) : null}
        />
      ) : products.length === 0 ? (
        <EmptyState
          compact
          icon={Package}
          title="Nothing saved yet"
          description="When shoppers heart listings, the favourites will rank here."
        />
      ) : (
        <>
          <RankingChart rows={rows} />
          <ol className="sr-only">
            {rows.map((row) => (
              <li key={row.id}>
                {row.rank}. {row.productName}, {savesLabel(row.saves)}, {shoppersLabel(row.shoppers)}
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  )
}
