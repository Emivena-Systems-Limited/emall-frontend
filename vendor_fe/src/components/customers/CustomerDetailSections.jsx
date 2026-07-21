import { Mail, MapPin, Phone, ShoppingBag, Package } from 'lucide-react'
import { getCustomerInitials } from '../../utils/customerUtils'

function formatMoney(amount) {
  return `GH₵ ${Number(amount).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`
}

function formatDateTime(value) {
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function CustomerDetailHeader({ customer }) {
  const uniqueProducts = customer.purchasedItems?.length ?? 0

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-brand-light/20 px-6 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand text-lg font-bold text-white shadow-[0_8px_24px_rgba(199,59,45,0.25)]">
              {getCustomerInitials(customer.name)}
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Customer profile</p>
              <h1 className="mt-0.5 text-2xl font-bold text-slate-950">{customer.name}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                <MapPin className="size-3.5 shrink-0" />
                {customer.city}, {customer.region}
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
      </div>

      <div className="grid grid-cols-2 gap-px bg-slate-100 sm:grid-cols-4">
        {[
          { label: 'Total orders', value: customer.totalOrders, icon: ShoppingBag },
          { label: 'Total spend', value: formatMoney(customer.totalSpend), icon: ShoppingBag },
          { label: 'Unique products', value: uniqueProducts, icon: Package },
          { label: 'Last order', value: formatDateTime(customer.lastOrderDate), icon: ShoppingBag, small: true },
        ].map(({ label, value, icon: Icon, small }) => (
          <div key={label} className="bg-white px-4 py-4">
            <div className="flex items-center gap-2">
              <Icon className="size-3.5 text-brand" strokeWidth={2} />
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
            </div>
            <p className={`mt-1 font-bold tabular-nums text-slate-950 ${small ? 'text-sm' : 'text-xl'}`}>{value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function CustomerOverviewPanel({ customer }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
        <h2 className="text-sm font-bold text-slate-900">Contact & delivery</h2>
        <dl className="mt-4 divide-y divide-slate-100">
          {[
            ['Email', customer.email],
            ['Phone', customer.phone],
            ['Address', customer.address],
            ['City', customer.city],
            ['Region', customer.region],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
              <dd className="text-sm font-medium text-slate-800 sm:text-right">{value || '—'}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
        <h2 className="text-sm font-bold text-slate-900">Purchase summary</h2>
        <dl className="mt-4 divide-y divide-slate-100">
          {[
            ['First purchase', formatDateTime(customer.firstPurchaseDate)],
            ['Last purchase', formatDateTime(customer.lastOrderDate)],
            ['Average order value', formatMoney(customer.totalSpend / Math.max(customer.totalOrders, 1))],
            ['Products bought', `${customer.purchasedItems?.length ?? 0} unique items`],
            ['Reviews left', customer.reviews.length],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
              <dd className="text-sm font-medium text-slate-800 sm:text-right">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}

export function CustomerDetailTabs({ activeTab, onTabChange, counts }) {
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'purchases', label: 'Items purchased', count: counts.purchases },
    { id: 'orders', label: 'Order history', count: counts.orders },
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
