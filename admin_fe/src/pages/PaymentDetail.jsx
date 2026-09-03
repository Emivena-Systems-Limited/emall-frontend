import { Link, useNavigate, useParams } from 'react-router'
import { useState } from 'react'
import {
  ArrowLeft,
  Calendar,
  Clock,
  CreditCard,
  Hash,
  MapPin,
  Phone,
  RotateCcw,
  ShoppingCart,
  Store,
  UserRound,
  Wallet,
} from 'lucide-react'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import DashboardReveal from '../components/dashboard/DashboardReveal'
import EmptyState from '../components/dashboard/EmptyState'
import OrderLineItems from '../components/orders/OrderLineItems'
import OrderStatusBadge from '../components/orders/OrderStatusBadge'
import PaymentStatusBadge from '../components/orders/PaymentStatusBadge'
import PaymentIdentity, { PaymentRosterSkeleton } from '../components/payments/PaymentIdentity'
import PaymentRefundModal from '../components/payments/PaymentRefundModal'
import PaymentStatusModal from '../components/payments/PaymentStatusModal'
import { canRefundPayment, canUpdatePaymentStatus, getPaymentStatusMeta } from '../constants/payments'
import { useAdminPayment } from '../hooks/useAdminPayments'
import { formatOrderMoney } from '../utils/formatters'
import { formatPaymentDate, formatPaymentDateTime } from '../utils/normalizeAdminPayments'
import { parseApiError } from '../utils/parseApiError'
import { formatPhoneDisplay } from '../utils/phoneUtils'

function FactRow({ icon: Icon, label, children }) {
  return (
    <div className="flex gap-3 py-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 ring-1 ring-slate-200">
        <Icon className="size-3.5" strokeWidth={2} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <div className="mt-0.5 text-sm font-medium break-words text-slate-900">{children}</div>
      </div>
    </div>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="text-sm font-medium tabular-nums text-slate-900">{value}</dd>
    </div>
  )
}

function CountCard({ label, value, hint, truncate = false }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-brand" />
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p
        className={`mt-1 font-bold tracking-tight text-slate-950 ${truncate ? 'truncate text-xl' : 'text-2xl tabular-nums'}`}
        title={truncate ? String(value) : undefined}
      >
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-[11px] text-slate-400">{hint}</p> : null}
    </div>
  )
}

function PaymentDetailSkeleton() {
  return (
    <DashboardLayout pageTitle="Payment">
      <div className="page-enter space-y-5" aria-busy="true" aria-label="Loading payment">
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:px-6">
          <div className="skeleton-shimmer h-3 w-28 rounded-md" />
          <div className="mt-5 space-y-2.5">
            <div className="skeleton-shimmer h-8 w-48 rounded-md" />
            <div className="skeleton-shimmer h-3.5 w-56 rounded-md" />
          </div>
        </section>
        <PaymentRosterSkeleton rows={4} />
      </div>
    </DashboardLayout>
  )
}

export default function PaymentDetail() {
  const { paymentId } = useParams()
  const navigate = useNavigate()
  const { item, isLoading, isError, error, refetch } = useAdminPayment(paymentId)
  const [statusOpen, setStatusOpen] = useState(false)
  const [refundOpen, setRefundOpen] = useState(false)

  if (isLoading) return <PaymentDetailSkeleton />

  if (isError) {
    return (
      <DashboardLayout pageTitle="Payment">
        <div className="page-enter">
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
            <EmptyState
              icon={Wallet}
              title="Could not load this payment"
              description={parseApiError(error, 'This payment is unavailable right now.').message}
              action={(
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  Try again
                </button>
              )}
            />
          </section>
        </div>
      </DashboardLayout>
    )
  }

  if (!item) {
    return (
      <DashboardLayout pageTitle="Payment">
        <div className="page-enter">
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
            <EmptyState
              icon={Wallet}
              title="This payment is not on the list"
              description="The link may be out of date, or this checkout charge is no longer returned by the API."
              action={(
                <button
                  type="button"
                  onClick={() => navigate('/payments')}
                  className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  Back to payments
                </button>
              )}
            />
          </section>
        </div>
      </DashboardLayout>
    )
  }

  const statusMeta = getPaymentStatusMeta(item.status)
  const showRefund = canRefundPayment(item)
  const showStatus = canUpdatePaymentStatus(item)
  const hasRightColumn = Boolean(
    item.storeName
    || item.shipping
    || item.billing
    || item.reference
    || item.paidAt
    || item.refundedAt
    || item.refundReason
    || (item.createdAt && item.createdAt !== item.paidAt),
  )

  return (
    <DashboardLayout pageTitle={item.orderNumber || 'Payment'}>
      <div className="page-enter space-y-5">
        <DashboardReveal index={0}>
          <header className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:px-6">
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-brand" />

            <Link
              to="/payments"
              className="mb-4 inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-brand"
            >
              <ArrowLeft className="size-3.5" />
              Back to payments
            </Link>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
                  Checkout charge
                </p>
                <div className="mt-3">
                  <PaymentIdentity item={item} size="lg" />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <PaymentStatusBadge status={item.status} />
                  <p className="text-sm text-slate-500">{statusMeta.helper}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {item.orderId ? (
                  <Link
                    to={`/orders/${encodeURIComponent(item.orderId)}`}
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:border-brand/40 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                  >
                    <ShoppingCart className="size-3.5" />
                    Open order
                  </Link>
                ) : null}
                {showStatus ? (
                  <button
                    type="button"
                    onClick={() => setStatusOpen(true)}
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:border-brand/40 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                  >
                    <CreditCard className="size-3.5" />
                    Update status
                  </button>
                ) : null}
                {showRefund ? (
                  <button
                    type="button"
                    onClick={() => setRefundOpen(true)}
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-rose-700 px-3.5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2"
                  >
                    <RotateCcw className="size-3.5" />
                    Issue refund
                  </button>
                ) : null}
              </div>
            </div>
          </header>
        </DashboardReveal>

        <DashboardReveal index={1}>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <CountCard label="Amount" value={formatOrderMoney(item.amount)} hint="Charged at checkout" />
            <CountCard label="Status" value={statusMeta.label} hint={statusMeta.helper} />
            <CountCard label="Method" value={item.method || 'Not set'} hint="How the shopper paid" />
            <CountCard
              label={item.storeName ? 'Store' : 'Items'}
              value={item.storeName || String(item.items.length || 0)}
              hint={item.storeCount > 1 ? `${item.storeCount} stores on this checkout` : 'Who received this checkout'}
              truncate
            />
          </div>
        </DashboardReveal>

        <DashboardReveal index={2}>
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
            <div className="border-b border-slate-100 px-5 py-3.5">
              <h3 className="text-sm font-bold text-slate-900">Details</h3>
              <p className="text-xs text-slate-500">Order, shopper, and reference for this charge</p>
            </div>
            <div className={`grid ${hasRightColumn ? 'lg:grid-cols-2 lg:divide-x lg:divide-slate-100' : ''}`}>
              <div className="divide-y divide-slate-100 px-5">
                {item.orderId || item.orderNumber ? (
                  <FactRow icon={ShoppingCart} label="Order">
                    {item.orderId ? (
                      <Link
                        to={`/orders/${encodeURIComponent(item.orderId)}`}
                        className="font-mono text-sm font-semibold text-brand hover:underline"
                      >
                        {item.orderNumber || 'Open order'}
                      </Link>
                    ) : (
                      <span className="font-mono">{item.orderNumber}</span>
                    )}
                    {item.orderStatus ? (
                      <span className="mt-1.5 block">
                        <OrderStatusBadge status={item.orderStatus} />
                      </span>
                    ) : null}
                  </FactRow>
                ) : null}
                {item.shopperName || item.shopperId ? (
                  <FactRow icon={UserRound} label="Shopper">
                    {item.shopperId ? (
                      <Link to={`/users/${encodeURIComponent(item.shopperId)}`} className="text-brand hover:underline">
                        {item.shopperName || 'Shopper'}
                      </Link>
                    ) : item.shopperName}
                    {item.shopperEmail ? (
                      <p className="mt-0.5 text-xs font-normal text-slate-500">{item.shopperEmail}</p>
                    ) : null}
                  </FactRow>
                ) : null}
                {item.shopperPhone ? (
                  <FactRow icon={Phone} label="Phone">{formatPhoneDisplay(item.shopperPhone)}</FactRow>
                ) : null}
              </div>
              {hasRightColumn ? (
                <div className="divide-y divide-slate-100 border-t border-slate-100 px-5 lg:border-t-0">
                  {item.storeName ? (
                    <FactRow icon={Store} label="Store">
                      {item.storeId ? (
                        <Link to={`/vendors/${encodeURIComponent(item.storeId)}`} className="text-brand hover:underline">
                          {item.storeName}
                        </Link>
                      ) : item.storeName}
                    </FactRow>
                  ) : null}
                  {item.shipping ? (
                    <FactRow icon={MapPin} label="Deliver to">
                      <div className="space-y-0.5">
                        {item.shipping.name ? <p>{item.shipping.name}</p> : null}
                        {item.shipping.lines.map((line) => (
                          <p key={line} className="text-sm font-normal text-slate-600">{line}</p>
                        ))}
                        {item.shipping.phone && item.shipping.phone !== item.shopperPhone ? (
                          <p className="text-sm font-normal text-slate-600">{formatPhoneDisplay(item.shipping.phone)}</p>
                        ) : null}
                      </div>
                    </FactRow>
                  ) : null}
                  {item.billing ? (
                    <FactRow icon={MapPin} label="Billing">
                      <div className="space-y-0.5">
                        {item.billing.name ? <p>{item.billing.name}</p> : null}
                        {item.billing.lines.map((line) => (
                          <p key={line} className="text-sm font-normal text-slate-600">{line}</p>
                        ))}
                      </div>
                    </FactRow>
                  ) : null}
                  {item.reference ? (
                    <FactRow icon={Hash} label="Reference">{item.reference}</FactRow>
                  ) : null}
                  {item.paidAt ? (
                    <FactRow icon={Calendar} label="Captured">{formatPaymentDateTime(item.paidAt)}</FactRow>
                  ) : null}
                  {item.refundedAt ? (
                    <FactRow icon={RotateCcw} label="Refunded">{formatPaymentDateTime(item.refundedAt)}</FactRow>
                  ) : null}
                  {item.refundReason ? (
                    <FactRow icon={RotateCcw} label="Refund note">{item.refundReason}</FactRow>
                  ) : null}
                  {item.createdAt && item.createdAt !== item.paidAt ? (
                    <FactRow icon={Clock} label="Created">{formatPaymentDateTime(item.createdAt)}</FactRow>
                  ) : null}
                </div>
              ) : null}
            </div>
          </section>
        </DashboardReveal>

        {item.items.length > 0 ? (
          <DashboardReveal index={3}>
            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-900">Items</h3>
                <p className="text-xs text-slate-500">What this checkout covered</p>
              </div>
              <OrderLineItems items={item.items} />
            </section>
          </DashboardReveal>
        ) : null}

        <DashboardReveal index={4}>
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
            <div className="border-b border-slate-100 px-5 py-3.5">
              <h3 className="text-sm font-bold text-slate-900">Checkout summary</h3>
              <p className="text-xs text-slate-500">How this charge was built</p>
            </div>
            <dl className="divide-y divide-slate-100 px-5">
              <SummaryRow label="Subtotal" value={formatOrderMoney(item.subtotal)} />
              {item.discount > 0 ? (
                <SummaryRow
                  label="Discount"
                  value={<span className="font-semibold text-emerald-700">−{formatOrderMoney(item.discount)}</span>}
                />
              ) : null}
              {item.deliveryFee > 0 ? (
                <SummaryRow label="Delivery" value={formatOrderMoney(item.deliveryFee)} />
              ) : null}
              {item.taxTotal > 0 ? (
                <SummaryRow label="Tax" value={formatOrderMoney(item.taxTotal)} />
              ) : null}
              <SummaryRow
                label="Total charged"
                value={<span className="text-base font-bold text-slate-950">{formatOrderMoney(item.orderTotal || item.amount)}</span>}
              />
            </dl>
          </section>
        </DashboardReveal>

        {item.transactions.length > 0 ? (
          <DashboardReveal index={5}>
            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
              <div className="border-b border-slate-100 px-5 py-3.5">
                <h3 className="text-sm font-bold text-slate-900">Activity</h3>
                <p className="text-xs text-slate-500">Charges and refunds recorded against this payment</p>
              </div>
              <ul className="divide-y divide-slate-100">
                {item.transactions.map((txn) => (
                  <li key={txn.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{txn.type}</p>
                      {txn.note ? <p className="mt-0.5 text-xs text-slate-500">{txn.note}</p> : null}
                      {txn.reference ? (
                        <p className="mt-1 font-mono text-[11px] text-slate-400">{txn.reference}</p>
                      ) : null}
                    </div>
                    <div className="shrink-0 text-left sm:text-right">
                      <p className="text-sm font-bold tabular-nums text-slate-950">{formatOrderMoney(txn.amount)}</p>
                      <div className="mt-1.5 flex items-center gap-2 sm:justify-end">
                        <PaymentStatusBadge status={txn.status} />
                        <span className="text-[11px] text-slate-400">{formatPaymentDate(txn.createdAt)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </DashboardReveal>
        ) : null}
      </div>

      <PaymentStatusModal
        open={statusOpen}
        item={item}
        onClose={() => setStatusOpen(false)}
      />
      <PaymentRefundModal
        open={refundOpen}
        item={item}
        onClose={() => setRefundOpen(false)}
      />
    </DashboardLayout>
  )
}
