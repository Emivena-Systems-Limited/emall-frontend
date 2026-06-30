import { Package } from 'lucide-react'
import OrderActionsMenu from './OrderActionsMenu'
import OrderStatusBadge from './OrderStatusBadge'
import PaymentStatusBadge from './PaymentStatusBadge'

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

function OrderMobileCard({ order, onPrint, onUpdateStatus }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900">{order.orderNumber}</p>
          <p className="mt-1 text-xs text-slate-500">{formatOrderDate(order.orderDate)}</p>
        </div>
        <OrderActionsMenu
          order={order}
          onPrint={onPrint}
          onUpdateStatus={onUpdateStatus}
        />
      </div>

      <div className="mt-3 space-y-1 text-sm">
        <p className="font-semibold text-slate-800">{order.customer.name}</p>
        <p className="truncate text-xs text-slate-500">
          {order.productsCount} product{order.productsCount === 1 ? '' : 's'} · {order.deliveryMethod}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <OrderStatusBadge status={order.orderStatus} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
        <p className="whitespace-nowrap text-sm font-bold text-slate-900">{formatMoney(order.totalAmount)}</p>
      </div>
    </article>
  )
}

export default function OrderTable({ orders, onPrint, onUpdateStatus }) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 ring-1 ring-slate-200">
          <Package className="size-6" strokeWidth={1.5} />
        </span>
        <p className="mt-4 text-sm font-semibold text-slate-800">No orders match your filters</p>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          Try adjusting your search or status filters to find the orders you are looking for.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3 p-4 lg:hidden">
        {orders.map((order) => (
          <OrderMobileCard
            key={order.id}
            order={order}
            onPrint={onPrint}
            onUpdateStatus={onUpdateStatus}
          />
        ))}
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-slate-100">
              <th className={TABLE_HEAD_CLASS}>Order Number</th>
              <th className={TABLE_HEAD_CLASS}>Order Date</th>
              <th className={TABLE_HEAD_CLASS}>Customer Name</th>
              <th className={TABLE_HEAD_CLASS}>Products</th>
              <th className={TABLE_HEAD_CLASS}>Total Amount</th>
              <th className={TABLE_HEAD_CLASS}>Payment Status</th>
              <th className={TABLE_HEAD_CLASS}>Order Status</th>
              <th className={TABLE_HEAD_CLASS}>Delivery Method</th>
              <th className={TABLE_HEAD_CLASS}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <tr key={order.id} className="text-sm text-slate-700">
                <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">
                  {order.orderNumber}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-600">
                  {formatOrderDate(order.orderDate)}
                </td>
                <td className="px-5 py-4">
                  <p className="whitespace-nowrap font-semibold text-slate-800">{order.customer.name}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{order.customer.email}</p>
                </td>
                <td className="whitespace-nowrap px-5 py-4">{order.productsCount}</td>
                <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">
                  {formatMoney(order.totalAmount)}
                </td>
                <td className="whitespace-nowrap px-5 py-4">
                  <PaymentStatusBadge status={order.paymentStatus} />
                </td>
                <td className="whitespace-nowrap px-5 py-4">
                  <OrderStatusBadge status={order.orderStatus} />
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-600">
                  {order.deliveryMethod}
                </td>
                <td className="whitespace-nowrap px-5 py-4">
                  <OrderActionsMenu
                    order={order}
                    onPrint={onPrint}
                    onUpdateStatus={onUpdateStatus}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
