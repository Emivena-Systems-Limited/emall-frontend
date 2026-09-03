import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router'
import { MapPin, Phone, UserRound, X } from 'lucide-react'
import DeliveryStatusBadge from './DeliveryStatusBadge'

function DetailRow({ label, value, singleLine = false }) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 py-3.5 last:border-b-0 sm:flex-row sm:items-start sm:justify-between">
      <dt className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd
        className={`text-sm font-medium text-slate-800 sm:max-w-[60%] sm:text-right ${
          singleLine ? 'whitespace-nowrap' : ''
        }`}
      >
        {value || '—'}
      </dd>
    </div>
  )
}

function DrawerSection({ icon: Icon, title, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-600 ring-1 ring-slate-200">
          <Icon className="size-4" strokeWidth={2} />
        </span>
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      </div>
      {children}
    </section>
  )
}

export default function OrderCustomerDeliveryDrawer({ open, order, onClose }) {
  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open || !order) return null

  const cityRegion = [order.delivery.city, order.delivery.region].filter(Boolean).join(', ')

  return createPortal(
    <>
      <div
        className="overlay-appear fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-customer-delivery-title"
        className="slide-in-right fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl"
      >
        <div className="relative overflow-hidden border-b border-slate-200 bg-linear-to-br from-brand-light/50 via-white to-white px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-brand/70">
                Customer &amp; delivery
              </p>
              <h2 id="order-customer-delivery-title" className="mt-1 text-lg font-bold text-slate-900">
                {order.orderNumber}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{order.customer.name}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-xl bg-white p-2 text-slate-400 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close panel"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
          <DrawerSection icon={UserRound} title="Customer Information">
            <dl>
              <DetailRow label="Customer Name" value={order.customer.name} />
              <DetailRow label="Email Address" value={order.customer.email} />
              <DetailRow label="Phone Number" value={order.customer.phone} singleLine />
            </dl>
            {order.userId ? (
              <Link
                to={`/users/${encodeURIComponent(order.userId)}`}
                className="mt-3 inline-flex text-sm font-semibold text-brand transition-colors hover:text-brand-hover"
              >
                Open user profile
              </Link>
            ) : null}
          </DrawerSection>

          <DrawerSection icon={MapPin} title="Delivery Information">
            <dl>
              <DetailRow label="Delivery Address" value={order.delivery.address} />
              {cityRegion ? <DetailRow label="City / Region" value={cityRegion} /> : null}
              {order.delivery.country ? (
                <DetailRow label="Country" value={order.delivery.country} singleLine />
              ) : null}
              <DetailRow label="Delivery Method" value={order.deliveryMethod} singleLine />
              <DetailRow label="Delivery Status" value={<DeliveryStatusBadge status={order.deliveryStatus} />} />
              <DetailRow label="Delivery Notes" value={order.delivery.notes || '—'} />
            </dl>
          </DrawerSection>

          {(order.customer.phone || order.delivery.address) && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Quick contact</p>
              {order.customer.phone ? (
                <a
                  href={`tel:${order.customer.phone}`}
                  className="mt-2 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-brand hover:text-brand-hover"
                >
                  <Phone className="size-4" />
                  {order.customer.phone}
                </a>
              ) : null}
              {order.delivery.address ? (
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{order.delivery.address}</p>
              ) : null}
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-slate-200 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full cursor-pointer rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </aside>
    </>,
    document.body,
  )
}
