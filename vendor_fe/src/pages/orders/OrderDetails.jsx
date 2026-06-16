import { Link, useParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import OrderStatusBadge from '../../components/dashboard/OrderStatusBadge'
import ProductThumbnail from '../../components/dashboard/ProductThumbnail'
import { getOrderById } from '../../constants/ordersData'

function formatOrderDateTime(value) {
  return new Date(value).toLocaleString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function OrderDetails() {
  const { orderId } = useParams()
  const order = getOrderById(orderId)

  if (!order) {
    return (
      <DashboardLayout pageTitle="Order details">
        <div className="page-enter rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-sm text-slate-600">Order not found.</p>
          <Link to="/orders" className="mt-4 inline-flex text-sm font-bold text-cyan-700 hover:text-cyan-900">
            Back to orders
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout pageTitle="Order details">
      <div className="page-enter space-y-5">
        <Link
          to="/orders"
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-brand"
        >
          <ArrowLeft className="size-4" />
          Back to orders
        </Link>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <ProductThumbnail src={order.thumbnail} alt={order.productName} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl font-bold text-slate-950">{order.id}</h1>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-800">{order.productName}</p>
              <p className="mt-1 text-sm text-slate-500">{formatOrderDateTime(order.dateTime)}</p>
            </div>
            <p className="text-2xl font-bold text-slate-950">
              GH₵ {order.amount.toLocaleString()}
            </p>
          </div>

          <p className="mt-6 text-sm text-slate-500">
            Full order workflow will connect here when the orders API is available.
          </p>
        </section>
      </div>
    </DashboardLayout>
  )
}
