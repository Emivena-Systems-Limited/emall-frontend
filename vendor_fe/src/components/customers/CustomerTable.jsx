import { formatMoney } from '../../utils/financeUtils'
import { getCustomerInitials } from '../../utils/customerUtils'
import CustomerRowActions from './CustomerRowActions'
import {
  CustomerFilterEmptyState,
  CustomerSearchEmptyState,
} from './CustomerEmptyState'

const TABLE_HEAD_CLASS =
  'whitespace-nowrap px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400'

function CustomerAvatar({ name }) {
  return (
    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-light text-xs font-bold text-brand ring-1 ring-brand/10">
      {getCustomerInitials(name)}
    </span>
  )
}

function CustomerMobileCard({ customer, onPrint }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <CustomerAvatar name={customer.name} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-900">{customer.name}</p>
            <p className="mt-1 truncate text-xs text-slate-500">{customer.email}</p>
          </div>
        </div>
        <CustomerRowActions customer={customer} onPrint={onPrint} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Phone</p>
          <p className="mt-1 font-medium text-slate-800">{customer.phone}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">City</p>
          <p className="mt-1 font-medium text-slate-800">{customer.city}</p>
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

export default function CustomerTable({ customers, onPrint, emptyVariant = 'filter' }) {
  if (customers.length === 0) {
    return emptyVariant === 'search'
      ? <CustomerSearchEmptyState />
      : <CustomerFilterEmptyState />
  }

  return (
    <>
      <div className="space-y-3 p-4 lg:hidden">
        {customers.map((customer) => (
          <CustomerMobileCard key={customer.id} customer={customer} onPrint={onPrint} />
        ))}
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-slate-100">
              <th className={TABLE_HEAD_CLASS}>Customer Name</th>
              <th className={TABLE_HEAD_CLASS}>Email</th>
              <th className={TABLE_HEAD_CLASS}>Phone Number</th>
              <th className={TABLE_HEAD_CLASS}>City</th>
              <th className={TABLE_HEAD_CLASS}>Total Orders</th>
              <th className={TABLE_HEAD_CLASS}>Total Spend</th>
              <th className={TABLE_HEAD_CLASS}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((customer) => (
              <tr key={customer.id} className="text-sm text-slate-700 hover:bg-slate-50/60">
                <td className="whitespace-nowrap px-5 py-4">
                  <div className="flex items-center gap-3">
                    <CustomerAvatar name={customer.name} />
                    <span className="font-semibold text-slate-900">{customer.name}</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-slate-600">{customer.email}</td>
                <td className="whitespace-nowrap px-5 py-4 text-slate-600">{customer.phone}</td>
                <td className="whitespace-nowrap px-5 py-4 text-slate-600">{customer.city}</td>
                <td className="whitespace-nowrap px-5 py-4">{customer.totalOrders}</td>
                <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">
                  {formatMoney(customer.totalSpend)}
                </td>
                <td className="whitespace-nowrap px-5 py-4">
                  <CustomerRowActions customer={customer} onPrint={onPrint} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
