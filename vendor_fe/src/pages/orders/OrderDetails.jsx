import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import {
  ArrowLeft,
  CreditCard,
  MapPin,
  Package,
  UserRound,
} from 'lucide-react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import OrderActionsMenu from '../../components/orders/OrderActionsMenu'
import OrderStatusBadge from '../../components/orders/OrderStatusBadge'
import PaymentStatusBadge from '../../components/orders/PaymentStatusBadge'
import UpdateOrderStatusModal from '../../components/orders/UpdateOrderStatusModal'
import { getOrderById } from '../../constants/ordersData'
import notify from '../../lib/notify'
import { printOrderReceipt } from '../../utils/printOrder'

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

function LineItemRow({ item }) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 py-4 last:border-b-0 sm:flex-row sm:items-center">
      {item.image ? (
        <img
          src={item.image}
          alt={item.productName}
          className="size-16 shrink-0 rounded-xl object-cover ring-1 ring-slate-200"
        />
      ) : (
        <span className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400 ring-1 ring-slate-200">
          <Package className="size-6" strokeWidth={1.5} />
        </span>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">{item.productName}</p>
        <p className="mt-1 text-xs text-slate-500">SKU: {item.sku}</p>
        <p className="mt-1 text-xs text-slate-500">Qty: {item.quantity}</p>
      </div>

      <div className="text-left sm:text-right">
        <p className="text-xs text-slate-500">Unit: {formatMoney(item.unitPrice)}</p>
        <p className="mt-1 text-sm font-bold text-slate-900">{formatMoney(item.totalPrice)}</p>
      </div>
    </div>
  )
}

export default function OrderDetails() {
  const { orderId } = useParams()
  const initialOrder = useMemo(() => getOrderById(orderId), [orderId])
  const [order, setOrder] = useState(initialOrder)
  const [statusUpdateRequest, setStatusUpdateRequest] = useState(null)

  useEffect(() => {
    setOrder(getOrderById(orderId))
  }, [orderId])

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

  const handlePrint = (targetOrder) => {
    const didPrint = printOrderReceipt(targetOrder)
    if (!didPrint) {
      notify.error('Unable to open the print window. Check your browser popup settings.')
    }
  }

  const handleStatusChange = (targetOrder, nextStatus) => {
    if (targetOrder.orderStatus === nextStatus) {
      setStatusUpdateRequest(null)
      return
    }

    setOrder((current) => ({ ...current, orderStatus: nextStatus }))
    setStatusUpdateRequest(null)
    notify.success(`Order ${targetOrder.orderNumber} updated to ${nextStatus.replaceAll('_', ' ')}.`)
  }

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
            order={order}
            onPrint={handlePrint}
            onUpdateStatus={setStatusUpdateRequest}
            align="start"
            hideViewDetails
          />
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Order</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-950">{order.orderNumber}</h1>
              <p className="mt-2 text-sm text-slate-500">{formatOrderDateTime(order.orderDate)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <OrderStatusBadge status={order.orderStatus} />
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-2">
          <SectionCard icon={CreditCard} title="Order Information">
            <dl>
              <DetailRow label="Order Number" value={order.orderNumber} />
              <DetailRow label="Order Date" value={formatOrderDateTime(order.orderDate)} />
              <DetailRow label="Payment Method" value={order.paymentMethod} singleLine />
              <DetailRow label="Payment Status" value={<PaymentStatusBadge status={order.paymentStatus} />} />
              <DetailRow label="Transaction Reference" value={order.transactionReference} singleLine />
            </dl>
          </SectionCard>

          <SectionCard icon={UserRound} title="Customer Information">
            <dl>
              <DetailRow label="Customer Name" value={order.customer.name} />
              <DetailRow label="Email Address" value={order.customer.email} />
              <DetailRow label="Phone Number" value={order.customer.phone} singleLine />
            </dl>
          </SectionCard>

          <SectionCard icon={MapPin} title="Delivery Information">
            <dl>
              <DetailRow label="Delivery Address" value={order.delivery.address} />
              <DetailRow label="Region" value={order.delivery.region} singleLine />
              <DetailRow label="City" value={order.delivery.city} singleLine />
              <DetailRow label="Delivery Method" value={order.deliveryMethod} singleLine />
              <DetailRow label="Delivery Notes" value={order.delivery.notes || '—'} />
            </dl>
          </SectionCard>

          <SectionCard icon={Package} title="Order Summary">
            <dl>
              <DetailRow label="Subtotal" value={formatMoney(order.subtotal)} singleLine />
              <DetailRow label="Delivery Fee" value={formatMoney(order.deliveryFee)} singleLine />
              <DetailRow label="Discount" value={formatMoney(order.discount)} singleLine />
              <DetailRow label="Total Amount" value={formatMoney(order.totalAmount)} singleLine />
            </dl>
          </SectionCard>
        </div>

        <SectionCard icon={Package} title="Ordered Products">
          <div>
            {order.items.map((item) => (
              <LineItemRow key={item.id} item={item} />
            ))}
          </div>
        </SectionCard>
      </div>

      <UpdateOrderStatusModal
        open={Boolean(statusUpdateRequest)}
        order={statusUpdateRequest ?? order}
        onClose={() => setStatusUpdateRequest(null)}
        onConfirm={handleStatusChange}
      />
    </DashboardLayout>
  )
}
