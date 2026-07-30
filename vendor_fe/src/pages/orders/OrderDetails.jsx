import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import {
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  CreditCard,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  UserRound,
} from 'lucide-react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import OrderLineItems from '../../components/orders/OrderLineItems'
import OrderCustomerDeliveryDrawer from '../../components/orders/OrderCustomerDeliveryDrawer'
import OrderActionsMenu from '../../components/orders/OrderActionsMenu'
import OrderStatusBadge from '../../components/orders/OrderStatusBadge'
import PaymentStatusBadge from '../../components/orders/PaymentStatusBadge'
import DeliveryStatusBadge from '../../components/orders/DeliveryStatusBadge'
import UpdateOrderStatusModal from '../../components/orders/UpdateOrderStatusModal'
import { useVendorOrder } from '../../hooks/useVendorOrders'
import { useUpdateOrderItemStatusMutation } from '../../hooks/useVendorOrderMutations'
import { deriveOrderStatusFromItems } from '../../utils/normalizeVendorOrders'
import notify from '../../lib/notify'

function formatOrderDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)

  return date.toLocaleString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatMoney(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return '—'
  return `GH₵ ${Number(amount).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`
}

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

export default function OrderDetails() {
  const { orderId } = useParams()
  const location = useLocation()
  const listPayment = location.state?.listPayment ?? null
  const { data: order, isLoading, isError, error, refetch, isFetching } = useVendorOrder(orderId, { listPayment })
  const updateItemStatus = useUpdateOrderItemStatusMutation()
  const [localOrder, setLocalOrder] = useState(null)
  const [statusUpdateItem, setStatusUpdateItem] = useState(null)
  const [customerDrawerOpen, setCustomerDrawerOpen] = useState(false)

  useEffect(() => {
    if (order) setLocalOrder(order)
  }, [order])

  if (isLoading) {
    return (
      <DashboardLayout pageTitle="Order details">
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-24 text-sm font-semibold text-slate-500">
          <Loader2 className="size-4 animate-spin text-brand" />
          Loading order…
        </div>
      </DashboardLayout>
    )
  }

  if (isError) {
    return (
      <DashboardLayout pageTitle="Order details">
        <div className="page-enter mx-auto max-w-md space-y-5 rounded-2xl border border-slate-200 bg-white py-16 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-100">
            <AlertTriangle className="size-6" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-950">Unable to load order</h1>
            <p className="mt-2 text-sm text-slate-500">
              {error?.message ?? 'Something went wrong while fetching this order.'}
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

  if (!localOrder) {
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

  const handleItemStatusChange = async (item, nextStatus) => {
    if (item.orderStatus === nextStatus) {
      setStatusUpdateItem(null)
      return
    }

    try {
      await updateItemStatus.mutateAsync({ orderItemId: item.id, status: nextStatus })

      setLocalOrder((current) => {
        const nextItems = current.items.map((line) =>
          line.id === item.id ? { ...line, orderStatus: nextStatus } : line,
        )

        return {
          ...current,
          items: nextItems,
          orderStatus: deriveOrderStatusFromItems(nextItems, current.orderStatus),
        }
      })

      setStatusUpdateItem(null)
      notify.success(`${item.productName} updated to ${nextStatus.replaceAll('_', ' ')}.`)
    } catch {
      // Error toast handled by mutation hook.
    }
  }

  const deliveryPreview = [localOrder.delivery.city, localOrder.delivery.region].filter(Boolean).join(', ')

  return (
    <DashboardLayout pageTitle="Order details">
      <div className="page-enter space-y-5 print:space-y-4">
        <div className="flex flex-col gap-4 print:hidden sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/orders"
            className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-brand"
          >
            <ArrowLeft className="size-4" />
            Back to orders
          </Link>

          <OrderActionsMenu
            order={localOrder}
            align="start"
            hideViewDetails
          />
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Order</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-950">{localOrder.orderNumber}</h1>
              <p className="mt-2 text-sm text-slate-500">{formatOrderDateTime(localOrder.orderDate)}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <OrderStatusBadge status={localOrder.orderStatus} />
              <DeliveryStatusBadge status={localOrder.deliveryStatus} />
              <PaymentStatusBadge status={localOrder.paymentStatus} />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCustomerDrawerOpen(true)}
            className="group mt-5 flex w-full cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-left transition-all hover:border-brand/25 hover:bg-brand-light/30 print:hidden"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand ring-1 ring-brand/15">
                <UserRound className="size-4" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900">{localOrder.customer.name}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                  {localOrder.customer.phone ? (
                    <span>{localOrder.customer.phone}</span>
                  ) : null}
                  {deliveryPreview ? (
                    <>
                      {localOrder.customer.phone ? <span aria-hidden>·</span> : null}
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
        </section>

        <SectionCard icon={Package} title={`Ordered Products (${localOrder.items.length})`}>
          <OrderLineItems
            items={localOrder.items}
            orderId={localOrder.id}
            onUpdateItemStatus={setStatusUpdateItem}
          />
        </SectionCard>

        <div className="grid gap-5 lg:grid-cols-2">
          <SectionCard icon={CreditCard} title="Order Information">
            <dl>
              <DetailRow label="Order Number" value={localOrder.orderNumber} />
              <DetailRow label="Order Date" value={formatOrderDateTime(localOrder.orderDate)} />
              <DetailRow label="Payment Status" value={<PaymentStatusBadge status={localOrder.paymentStatus} />} />
              <DetailRow label="Transaction Reference" value={localOrder.transactionReference} singleLine />
            </dl>
          </SectionCard>

          <SectionCard icon={Package} title="Order Summary">
            <dl>
              <DetailRow label="Subtotal" value={formatMoney(localOrder.subtotal)} singleLine />
              {localOrder.discount > 0 ? (
                <DetailRow
                  label="Discount"
                  value={
                    <span className="font-semibold text-emerald-700">−{formatMoney(localOrder.discount)}</span>
                  }
                  singleLine
                />
              ) : (
                <DetailRow label="Discount" value={formatMoney(localOrder.discount)} singleLine />
              )}
              <DetailRow label="Delivery Fee" value={formatMoney(localOrder.deliveryFee)} singleLine />
              {localOrder.taxTotal > 0 ? (
                <DetailRow label="Tax" value={formatMoney(localOrder.taxTotal)} singleLine />
              ) : null}
              <DetailRow
                label="Total Amount"
                value={<span className="text-base font-bold text-slate-950">{formatMoney(localOrder.totalAmount)}</span>}
                singleLine
              />
            </dl>
          </SectionCard>
        </div>
      </div>

      <OrderCustomerDeliveryDrawer
        open={customerDrawerOpen}
        order={localOrder}
        onClose={() => setCustomerDrawerOpen(false)}
      />

      <UpdateOrderStatusModal
        open={Boolean(statusUpdateItem)}
        item={statusUpdateItem}
        orderNumber={localOrder.orderNumber}
        onClose={() => setStatusUpdateItem(null)}
        onConfirm={handleItemStatusChange}
        isLoading={updateItemStatus.isPending}
      />
    </DashboardLayout>
  )
}
