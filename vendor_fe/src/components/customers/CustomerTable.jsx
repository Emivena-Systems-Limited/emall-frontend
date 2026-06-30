import { Users } from 'lucide-react'
import CustomerActionsMenu from './CustomerActionsMenu'

const TABLE_HEAD_CLASS =
  'whitespace-nowrap px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400'

function formatOrderDate(value) {
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatMoney(amount) {
  return `GH₵ ${Number(amount).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`
}

function CustomerMobileCard({ customer, onPrint }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900">{customer.name}</p>
          <p className="mt-1 truncate text-xs text-slate-500">{customer.email}</p>
        </div>
        <CustomerActionsMenu customer={customer} onPrint={onPrint} />
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

      <p className="mt-3 text-xs text-slate-500">
        Last order: {formatOrderDate(customer.lastOrderDate)}
      </p>
    </article>
  )
}

export default function CustomerTable({ customers, onPrint }) {
  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 ring-1 ring-slate-200">
          <Users className="size-6" strokeWidth={1.5} />
        </span>
        <p className="mt-4 text-sm font-semibold text-slate-800">No customers match your filters</p>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          Try adjusting your search or filters to find the customers you are looking for.
        </p>
      </div>
    )
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
              <th className={TABLE_HEAD_CLASS}>Order Date</th>
              <th className={TABLE_HEAD_CLASS}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((customer) => (
              <tr key={customer.id} className="text-sm text-slate-700">
                <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">
                  {customer.name}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-slate-600">{customer.email}</td>
                <td className="whitespace-nowrap px-5 py-4 text-slate-600">{customer.phone}</td>
                <td className="whitespace-nowrap px-5 py-4 text-slate-600">{customer.city}</td>
                <td className="whitespace-nowrap px-5 py-4">{customer.totalOrders}</td>
                <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">
                  {formatMoney(customer.totalSpend)}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-600">
                  {formatOrderDate(customer.lastOrderDate)}
                </td>
                <td className="whitespace-nowrap px-5 py-4">
                  <CustomerActionsMenu customer={customer} onPrint={onPrint} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
