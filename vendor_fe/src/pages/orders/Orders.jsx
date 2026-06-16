import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import OrderStatusBadge from '../../components/dashboard/OrderStatusBadge'
import ProductThumbnail from '../../components/dashboard/ProductThumbnail'
import EmptyState from '../../components/dashboard/EmptyState'
import { RECENT_ORDERS } from '../../constants/ordersData'
import { EMPTY_STATE_PRESETS } from '../../constants/emptyStates'

function formatOrderDateTime(value) {
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function Orders({ orders = RECENT_ORDERS }) {
  const preset = EMPTY_STATE_PRESETS.orders

  return (
    <DashboardLayout pageTitle="Orders">
      <div className="page-enter space-y-5">
        <Link
          to="/dashboard"
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-brand"
        >
          <ArrowLeft className="size-4" />
          Back to dashboard
        </Link>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
          <div className="border-b border-slate-100 px-5 py-4">
            <h1 className="text-lg font-bold text-slate-950">All orders</h1>
            <p className="mt-1 text-sm text-slate-500">Sample data until the orders API is connected.</p>
          </div>

          {orders.length === 0 ? (
            <EmptyState
              icon={preset.icon}
              title={preset.title}
              description={preset.description}
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {orders.map((order) => (
              <li key={order.id}>
                <Link
                  to={`/orders/${order.id}`}
                  className="flex cursor-pointer items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50/80"
                >
                  <ProductThumbnail src={order.thumbnail} alt={order.productName} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">{order.id}</p>
                    <p className="truncate text-sm text-slate-600">{order.productName}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatOrderDateTime(order.dateTime)}</p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                  <p className="whitespace-nowrap text-sm font-bold text-slate-900">
                    GH₵ {order.amount.toLocaleString()}
                  </p>
                </Link>
              </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </DashboardLayout>
  )
}
