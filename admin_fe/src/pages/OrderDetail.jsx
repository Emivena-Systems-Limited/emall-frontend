import { useState } from 'react'
import { Link, useParams } from 'react-router'
import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  ChevronRight,
  CreditCard,
  MapPin,
  Package,
  RefreshCw,
  Store,
  Truck,
  UserRound,
} from 'lucide-react'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import OrderLineItems from '../components/orders/OrderLineItems'
import OrderCustomerDeliveryDrawer from '../components/orders/OrderCustomerDeliveryDrawer'
import OrderStatusBadge from '../components/orders/OrderStatusBadge'
import PaymentStatusBadge from '../components/orders/PaymentStatusBadge'
import DeliveryStatusBadge from '../components/orders/DeliveryStatusBadge'
import OrderPaymentStatusModal from '../components/orders/OrderPaymentStatusModal'
import OrderDeliveryStatusModal from '../components/orders/OrderDeliveryStatusModal'
import OrderCancelModal from '../components/orders/OrderCancelModal'
import { canCancelOrder, canUpdateOrderDelivery } from '../constants/adminOrders'
import { useAdminOrder } from '../hooks/useAdminOrders'
import { formatOrderDateTime } from '../utils/normalizeAdminOrders'
import { formatOrderMoney } from '../utils/formatters'
import { parseApiError } from '../utils/parseApiError'

function SectionCard({ icon: Icon, title, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 ring-1 ring-slate-200">
          <Icon className="size-4" strokeWidth={2} />
        </span>
        <h2 className="whitespace-nowrap text-sm font-bold text-slate-900">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function DetailRow({ label, value, singleLine = false }) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 py-3 last:border-b-0 sm:flex-row sm:items-start sm:justify-between">
      <dt className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd
        className={`text-sm font-medium text-slate-800 sm:max-w-[65%] sm:text-right ${
          singleLine ? 'whitespace-nowrap' : ''
        }`}
      >
        {value || '—'}
      </dd>
    </div>
  )
}

function OrderDetailLoader() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading order">
      <div className="h-8 w-40 skeleton-shimmer rounded-lg" />
      <div className="h-36 skeleton-shimmer rounded-2xl" />
      <div className="h-64 skeleton-shimmer rounded-2xl" />
    </div>
  )
}

export default function OrderDetail() {
  const { orderId } = useParams()
  const { order, isLoading, isError, error, refetch, isFetching } = useAdminOrder(orderId)
  const [customerDrawerOpen, setCustomerDrawerOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [deliveryOpen, setDeliveryOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)

  if (isLoading) {
    return (
      <DashboardLayout pageTitle="Order details">
        <OrderDetailLoader />
      </DashboardLayout>
    )
  }

  if (isError || !order) {
    return (
      <DashboardLayout pageTitle="Order details">
        <div className="page-enter mx-auto max-w-md space-y-5 rounded-2xl border border-slate-200 bg-white py-16 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-100">
            <AlertTriangle className="size-6" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-950">Unable to load order</h1>
            <p className="mt-2 text-sm text-slate-500">
              {parseApiError(error, 'This order may have been removed, or you may not have permission to view it.').message}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
              Retry
            </button>
            <Link
              to="/orders"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-hover"
            >
              <ArrowLeft className="size-4" />
              Back to orders
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const deliveryPreview = [order.delivery?.city, order.delivery?.region].filter(Boolean).join(', ')
  const canDeliver = canUpdateOrderDelivery(order)
  const canCancel = canCancelOrder(order)

  return (
    <DashboardLayout pageTitle={order.orderNumber}>
      <div className="page-enter space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/orders"
            className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-brand"
          >
            <ArrowLeft className="size-4" />
            All orders
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setPaymentOpen(true)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:border-brand/30 hover:bg-brand-light/30 hover:text-brand"
            >
              <CreditCard className="size-3.5" aria-hidden="true" />
              Update payment
            </button>
            {canDeliver ? (
              <button
                type="button"
                onClick={() => setDeliveryOpen(true)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:border-brand/30 hover:bg-brand-light/30 hover:text-brand"
              >
                <Truck className="size-3.5" aria-hidden="true" />
                Update delivery
              </button>
            ) : null}
            {canCancel ? (
              <button
                type="button"
                onClick={() => setCancelOpen(true)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-50"
              >
                <Ban className="size-3.5" aria-hidden="true" />
                Cancel order
              </button>
            ) : null}
          </div>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Order</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-950">{order.orderNumber}</h1>
              <p className="mt-2 text-sm text-slate-500">{formatOrderDateTime(order.orderDate)}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <OrderStatusBadge status={order.orderStatus} />
              <DeliveryStatusBadge status={order.deliveryStatus} />
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setCustomerDrawerOpen(true)}
              className="group flex w-full cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-left transition-all hover:border-brand/25 hover:bg-brand-light/30"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand ring-1 ring-brand/15">
                  <UserRound className="size-4" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">{order.customer?.name || 'Shopper'}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                    {order.customer?.phone ? <span>{order.customer.phone}</span> : null}
                    {deliveryPreview ? (
                      <>
                        {order.customer?.phone ? <span aria-hidden="true">·</span> : null}
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3 shrink-0" />
                          {deliveryPreview}
                        </span>
                      </>
                    ) : null}
                  </p>
                </div>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-brand transition group-hover:gap-1.5">
                View details
                <ChevronRight className="size-4" />
              </span>
            </button>

            {order.vendorId ? (
              <Link
                to={`/vendors/${order.vendorId}`}
                className="group flex w-full items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-left transition-all hover:border-brand/25 hover:bg-brand-light/30"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-700 ring-1 ring-slate-200">
                    <Store className="size-4" strokeWidth={2} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900">{order.vendorName || 'Store'}</p>
                    <p className="mt-0.5 text-xs text-slate-500">Open vendor workspace</p>
                  </div>
                </div>
                <ChevronRight className="size-4 text-brand" />
              </Link>
            ) : order.vendorName ? (
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3.5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-700 ring-1 ring-slate-200">
                  <Store className="size-4" strokeWidth={2} />
                </span>
                <p className="text-sm font-bold text-slate-900">{order.vendorName}</p>
              </div>
            ) : null}
          </div>
        </section>

        <SectionCard icon={Package} title={`Ordered products (${order.items.length})`}>
          <OrderLineItems items={order.items} />
        </SectionCard>

        <div className="grid gap-5 lg:grid-cols-2">
          <SectionCard icon={CreditCard} title="Order information">
            <dl>
              <DetailRow label="Order number" value={order.orderNumber} />
              <DetailRow label="Order date" value={formatOrderDateTime(order.orderDate)} />
              <DetailRow label="Payment" value={<PaymentStatusBadge status={order.paymentStatus} />} />
              <DetailRow label="Payment method" value={order.paymentMethod} />
              <DetailRow label="Transaction reference" value={order.transactionReference} singleLine />
            </dl>
          </SectionCard>

          <SectionCard icon={Package} title="Order summary">
            <dl>
              <DetailRow label="Subtotal" value={formatOrderMoney(order.subtotal)} singleLine />
              {order.discount > 0 ? (
                <DetailRow
                  label="Discount"
                  value={<span className="font-semibold text-emerald-700">−{formatOrderMoney(order.discount)}</span>}
                  singleLine
                />
              ) : null}
              <DetailRow label="Delivery fee" value={formatOrderMoney(order.deliveryFee)} singleLine />
              {order.taxTotal > 0 ? (
                <DetailRow label="Tax" value={formatOrderMoney(order.taxTotal)} singleLine />
              ) : null}
              <DetailRow
                label="Total paid"
                value={<span className="text-base font-bold text-slate-950">{formatOrderMoney(order.totalAmount)}</span>}
                singleLine
              />
            </dl>
          </SectionCard>
        </div>
      </div>

      <OrderCustomerDeliveryDrawer
        open={customerDrawerOpen}
        order={order}
        onClose={() => setCustomerDrawerOpen(false)}
      />
      <OrderPaymentStatusModal
        open={paymentOpen}
        order={order}
        onClose={() => setPaymentOpen(false)}
      />
      <OrderDeliveryStatusModal
        open={deliveryOpen}
        order={order}
        onClose={() => setDeliveryOpen(false)}
      />
      <OrderCancelModal
        open={cancelOpen}
        order={order}
        onClose={() => setCancelOpen(false)}
      />
    </DashboardLayout>
  )
}
