import {
  Calendar,
  Clock,
  Globe,
  Mail,
  MapPin,
  Phone,
  ShoppingBag,
  Package,
  Star,
  UserRound,
} from 'lucide-react'
import { formatDateTime, formatMoney, formatShortDate } from '../../utils/financeUtils'
import { getCustomerInitials } from '../../utils/customerUtils'

const INNER_TILE_CLASS =
  'rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 ring-1 ring-slate-100/80'

function formatCustomerLocation(customer) {
  const parts = [customer.city, customer.region].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : '—'
}

function OverviewSectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand ring-1 ring-brand/10">
          <Icon className="size-4" strokeWidth={2} />
        </span>
        <div>
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{subtitle}</p> : null}
        </div>
      </div>
    </div>
  )
}

function InfoTile({ label, value }) {
  return (
    <div className={INNER_TILE_CLASS}>
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value || '—'}</p>
    </div>
  )
}

function ContactEmailLink({ value }) {
  if (!value) {
    return <p className="text-sm text-slate-400">—</p>
  }

  return (
    <a
      href={`mailto:${value}`}
      className="group flex min-w-0 items-center gap-3 rounded-xl border border-violet-100 bg-violet-50/50 px-3 py-3 transition-colors hover:border-violet-200 hover:bg-violet-50"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-violet-600 shadow-sm ring-1 ring-violet-100">
        <Mail className="size-4" strokeWidth={2} />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wide text-violet-600/80">Email</p>
        <p className="truncate text-sm font-semibold text-slate-800 group-hover:text-violet-800">{value}</p>
      </div>
    </a>
  )
}

function ContactPhoneLink({ value }) {
  if (!value) {
    return <p className="text-sm text-slate-400">—</p>
  }

  const telHref = value.replace(/\s/g, '')

  return (
    <a
      href={`tel:${telHref}`}
      className="group flex min-w-0 items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 px-3 py-3 transition-colors hover:border-emerald-200 hover:bg-emerald-50"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100">
        <Phone className="size-4" strokeWidth={2} />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600/80">Phone</p>
        <p className="truncate text-sm font-semibold tabular-nums text-slate-800 group-hover:text-emerald-800">{value}</p>
      </div>
    </a>
  )
}

function LocationBlock({ customer }) {
  const hasAddress = Boolean(customer.address)
  const hasLocation = Boolean(customer.city || customer.region || customer.country)

  if (!hasAddress && !hasLocation) {
    return (
      <div className={INNER_TILE_CLASS}>
        <p className="text-sm text-slate-400">No delivery address on file</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-sky-100 bg-gradient-to-br from-sky-50/80 to-white p-4 ring-1 ring-sky-100/80">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-sky-600 shadow-sm ring-1 ring-sky-100">
          <MapPin className="size-4" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wide text-sky-600/90">Delivery location</p>
          {hasAddress ? (
            <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-900">{customer.address}</p>
          ) : null}
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <div className="rounded-lg bg-white/80 px-3 py-2 ring-1 ring-sky-100/80">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">City</p>
              <p className="mt-0.5 text-sm font-medium text-slate-800">{customer.city || '—'}</p>
            </div>
            <div className="rounded-lg bg-white/80 px-3 py-2 ring-1 ring-sky-100/80">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Region</p>
              <p className="mt-0.5 text-sm font-medium text-slate-800">{customer.region || '—'}</p>
            </div>
            <div className="rounded-lg bg-white/80 px-3 py-2 ring-1 ring-sky-100/80">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Country</p>
              <p className="mt-0.5 text-sm font-medium text-slate-800">{customer.country || '—'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryMetricCard({ label, value, icon: Icon, tone = 'slate' }) {
  const tones = {
    brand: 'border-brand/15 bg-brand-light/30 text-brand',
    emerald: 'border-emerald-100 bg-emerald-50/60 text-emerald-600',
    amber: 'border-amber-100 bg-amber-50/60 text-amber-600',
    slate: 'border-slate-100 bg-slate-50/80 text-slate-600',
  }

  return (
    <div className={`rounded-xl border px-3 py-3 ${tones[tone] ?? tones.slate}`}>
      <div className="flex items-center gap-2">
        <Icon className="size-3.5 shrink-0" strokeWidth={2} />
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
      </div>
      <p className="mt-1.5 text-lg font-bold tabular-nums text-slate-950">{value}</p>
    </div>
  )
}

function TimelineCard({ label, value, icon: Icon }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 ring-1 ring-slate-100/80">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <Icon className="size-3.5" strokeWidth={2} />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  )
}

export default function CustomerDetailHeader({ customer }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="bg-gradient-to-r from-slate-50 to-brand-light/20 px-6 py-5">
        <div className="flex items-start gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand text-lg font-bold text-white shadow-[0_8px_24px_rgba(199,59,45,0.25)]">
            {getCustomerInitials(customer.name)}
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Customer profile</p>
            <h1 className="mt-0.5 text-2xl font-bold text-slate-950">{customer.name}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
              <MapPin className="size-3.5 shrink-0" />
              {formatCustomerLocation(customer)}
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="size-3.5 text-slate-400" />
                {customer.email}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="size-3.5 text-slate-400" />
                {customer.phone}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function CustomerOverviewPanel({ customer }) {
  const reviewsCount = customer.reviewsCount ?? customer.reviews?.length ?? 0
  const orderCountLabel = customer.totalOrders === 1 ? '1 order' : `${customer.totalOrders} orders`

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
        <OverviewSectionHeader
          icon={UserRound}
          title="Contact details"
          subtitle="How to reach this customer and where deliveries go"
        />

        <div className="space-y-5 px-5 py-5 sm:px-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoTile label="First name" value={customer.firstName} />
            <InfoTile label="Last name" value={customer.lastName} />
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Contact channels</p>
            <ContactEmailLink value={customer.email} />
            <ContactPhoneLink value={customer.phone} />
          </div>

          <LocationBlock customer={customer} />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
        <OverviewSectionHeader
          icon={ShoppingBag}
          title="Purchase summary"
          subtitle="Order activity and spending with your store"
        />

        <div className="space-y-5 px-5 py-5 sm:px-6">
          <div className="rounded-2xl border border-brand/15 bg-gradient-to-br from-brand/10 via-brand-light/40 to-white p-5 ring-1 ring-brand/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-brand/80">Lifetime spend</p>
                <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-slate-950">
                  {formatMoney(customer.totalSpend)}
                </p>
                <p className="mt-2 text-xs text-slate-600">
                  <Package className="mr-1 inline size-3.5 text-brand" strokeWidth={2} />
                  <span className="font-semibold text-slate-800">{orderCountLabel}</span>
                  {' '}with your store
                </p>
              </div>
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-brand shadow-sm ring-1 ring-brand/10">
                <ShoppingBag className="size-5" strokeWidth={2} />
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <SummaryMetricCard label="Orders" value={customer.totalOrders} icon={Package} tone="brand" />
            <SummaryMetricCard label="Reviews" value={reviewsCount} icon={Star} tone="amber" />
            <SummaryMetricCard
              label="Last order"
              value={formatShortDate(customer.lastOrderDate)}
              icon={Clock}
              tone="emerald"
            />
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Purchase timeline</p>
            <TimelineCard
              label="First purchase"
              value={formatDateTime(customer.firstPurchaseDate)}
              icon={Calendar}
            />
            <TimelineCard
              label="Last purchase"
              value={formatDateTime(customer.lastOrderDate)}
              icon={Clock}
            />
          </div>

          {customer.country ? (
            <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-100/80">
              <Globe className="size-4 shrink-0 text-slate-400" strokeWidth={2} />
              <span>
                Primary market: <span className="font-semibold text-slate-800">{customer.country}</span>
              </span>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}

export function CustomerDetailTabs({ activeTab, onTabChange, counts }) {
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'reviews', label: 'Reviews', count: counts.reviews },
  ]

  return (
    <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-px">
      {tabs.map((tab) => {
        const active = activeTab === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-t-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
              active
                ? 'border border-b-white border-slate-200 bg-white text-brand -mb-px'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            {tab.label}
            {typeof tab.count === 'number' && tab.count > 0 && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${active ? 'bg-brand-light text-brand' : 'bg-slate-100 text-slate-500'}`}>
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
