import { Mail, Phone, UserRound } from 'lucide-react'
import { formatMoney } from '../../utils/financeUtils'
import CustomerRowActions from './CustomerRowActions'
import {
  CustomerFilterEmptyState,
  CustomerSearchEmptyState,
} from './CustomerEmptyState'

const TABLE_HEAD_CLASS =
  'whitespace-nowrap px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400'

const CUSTOMER_ICON_THEMES = [
  { surface: 'bg-sky-50', ring: 'ring-sky-100/90', icon: 'text-sky-600' },
  { surface: 'bg-violet-50', ring: 'ring-violet-100/90', icon: 'text-violet-600' },
  { surface: 'bg-emerald-50', ring: 'ring-emerald-100/90', icon: 'text-emerald-600' },
  { surface: 'bg-amber-50', ring: 'ring-amber-100/90', icon: 'text-amber-600' },
  { surface: 'bg-cyan-50', ring: 'ring-cyan-100/90', icon: 'text-cyan-600' },
  { surface: 'bg-rose-50', ring: 'ring-rose-100/90', icon: 'text-rose-600' },
]

function getCustomerIconTheme(customerId) {
  const seed = String(customerId ?? '')
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0)

  return CUSTOMER_ICON_THEMES[seed % CUSTOMER_ICON_THEMES.length]
}

function CustomerIconBadge({ customerId }) {
  const theme = getCustomerIconTheme(customerId)

  return (
    <span
      className={`inline-flex size-10 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1 ${theme.surface} ${theme.ring}`}
      aria-hidden="true"
    >
      <UserRound className={`size-4 ${theme.icon}`} strokeWidth={2} />
    </span>
  )
}

function EmailContact({ value, maxWidthClass = 'max-w-full' }) {
  if (!value) {
    return <span className="text-sm text-slate-400">—</span>
  }

  return (
    <a
      href={`mailto:${value}`}
      className={`group inline-flex ${maxWidthClass} min-w-0 items-center gap-2.5 rounded-xl border border-violet-100/80 bg-violet-50/40 px-2.5 py-2 transition-colors hover:border-violet-200 hover:bg-violet-50`}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-violet-600 shadow-sm ring-1 ring-violet-100">
        <Mail className="size-3.5" strokeWidth={2} aria-hidden="true" />
      </span>
      <span className="min-w-0 truncate text-sm font-medium text-slate-700 group-hover:text-violet-800">
        {value}
      </span>
    </a>
  )
}

function PhoneContact({ value, maxWidthClass = 'max-w-full' }) {
  if (!value) {
    return <span className="text-sm text-slate-400">—</span>
  }

  const telHref = value.replace(/\s/g, '')

  return (
    <a
      href={`tel:${telHref}`}
      className={`group inline-flex ${maxWidthClass} min-w-0 items-center gap-2.5 rounded-xl border border-emerald-100/80 bg-emerald-50/40 px-2.5 py-2 transition-colors hover:border-emerald-200 hover:bg-emerald-50`}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100">
        <Phone className="size-3.5" strokeWidth={2} aria-hidden="true" />
      </span>
      <span className="min-w-0 truncate text-sm font-medium tabular-nums text-slate-700 group-hover:text-emerald-800">
        {value}
      </span>
    </a>
  )
}

function CustomerMobileCard({ customer, onPrint, orderFilters }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <CustomerIconBadge customerId={customer.id} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-900">{customer.name}</p>
            <div className="mt-2">
              <EmailContact value={customer.email} />
            </div>
          </div>
        </div>
        <CustomerRowActions customer={customer} onPrint={onPrint} orderFilters={orderFilters} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div className="sm:col-span-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Phone</p>
          <div className="mt-1.5">
            <PhoneContact value={customer.phone} />
          </div>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">City</p>
          <p className="mt-1 font-medium text-slate-800">{customer.city || '—'}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Region</p>
          <p className="mt-1 font-medium text-slate-800">{customer.region || '—'}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Orders</p>
          <p className="mt-1 font-medium text-slate-800">{customer.totalOrders}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Spend</p>
          <p className="mt-1 font-semibold text-slate-900">{formatMoney(customer.totalSpend)}</p>
        </div>
      </div>
    </article>
  )
}

export default function CustomerTable({
  customers,
  onPrint,
  emptyVariant = 'filter',
  orderFilters,
}) {
  if (customers.length === 0) {
    return emptyVariant === 'search'
      ? <CustomerSearchEmptyState />
      : <CustomerFilterEmptyState />
  }

  return (
    <>
      <div className="space-y-3 p-4 lg:hidden">
        {customers.map((customer) => (
          <CustomerMobileCard
            key={customer.id}
            customer={customer}
            onPrint={onPrint}
            orderFilters={orderFilters}
          />
        ))}
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className={TABLE_HEAD_CLASS}>Customer Name</th>
              <th className={TABLE_HEAD_CLASS}>Email</th>
              <th className={TABLE_HEAD_CLASS}>Phone Number</th>
              <th className={TABLE_HEAD_CLASS}>City</th>
              <th className={TABLE_HEAD_CLASS}>Region</th>
              <th className={TABLE_HEAD_CLASS}>Total Orders</th>
              <th className={TABLE_HEAD_CLASS}>Total Spend</th>
              <th className={TABLE_HEAD_CLASS}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((customer) => (
              <tr key={customer.id} className="text-sm text-slate-700 transition-colors hover:bg-slate-50/60">
                <td className="whitespace-nowrap px-5 py-4">
                  <div className="flex items-center gap-3">
                    <CustomerIconBadge customerId={customer.id} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{customer.name}</p>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-5 py-4">
                  <EmailContact value={customer.email} maxWidthClass="max-w-[260px]" />
                </td>
                <td className="whitespace-nowrap px-5 py-4">
                  <PhoneContact value={customer.phone} maxWidthClass="max-w-[200px]" />
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-slate-600">{customer.city || '—'}</td>
                <td className="whitespace-nowrap px-5 py-4 text-slate-600">{customer.region || '—'}</td>
                <td className="whitespace-nowrap px-5 py-4 font-medium tabular-nums">{customer.totalOrders}</td>
                <td className="whitespace-nowrap px-5 py-4 font-semibold tabular-nums text-slate-900">
                  {formatMoney(customer.totalSpend)}
                </td>
                <td className="whitespace-nowrap px-5 py-4">
                  <CustomerRowActions customer={customer} onPrint={onPrint} orderFilters={orderFilters} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
