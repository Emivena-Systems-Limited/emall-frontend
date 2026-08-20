import { useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { MoreHorizontal, Package, Printer, Truck } from 'lucide-react'
import PortalMenu from '../common/PortalMenu'
import notify from '../../lib/notify'
import {
  buildOrderNavigationState,
  mergeOrderNavigationState,
  resolveOrdersReturnTo,
} from '../../utils/orderNavigation'
import {
  buildViewProductPath,
  getUniqueOrderProducts,
  getViewProductTarget,
} from '../../utils/orderProductNavigation'
import { resolvePaymentRecord } from '../../utils/normalizeVendorOrders'

function resolveListPayment(order) {
  return order?.payment ?? resolvePaymentRecord(order?.raw)
}

function resolveParentOrderId(order) {
  return order?.orderId || order?.id
}

function navigateWithListPayment(navigate, path, order, { returnTo } = {}) {
  const state = buildOrderNavigationState({
    returnTo,
    listPayment: resolveListPayment(order),
    listOrder: order,
  })

  navigate(path, state ? { state } : undefined)
}

function OrderMenuAction({ icon: Icon, label, hint, disabled, onClick }) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm font-semibold transition-colors focus-visible:outline-none ${
        disabled
          ? 'cursor-not-allowed text-slate-400'
          : 'cursor-pointer text-slate-800 hover:bg-slate-50 focus-visible:bg-slate-50'
      }`}
    >
      <Icon className={`size-4 shrink-0 ${disabled ? 'text-slate-300' : 'text-slate-500'}`} strokeWidth={2} />
      <span className="min-w-0">
        <span className="block">{label}</span>
        {hint ? <span className="mt-0.5 block text-[11px] font-medium text-slate-400">{hint}</span> : null}
      </span>
    </button>
  )
}

export default function OrderActionsMenu({
  order,
  align = 'end',
  hideUpdateDeliveryStatus = false,
  onUpdateDeliveryStatus,
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const ordersReturnTo = resolveOrdersReturnTo(location)
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)
  const orderProducts = getUniqueOrderProducts(order)
  const hasLinkedProducts = orderProducts.length > 0
  const parentOrderId = resolveParentOrderId(order)

  const close = () => setOpen(false)

  const run = (action) => {
    action()
    close()
  }

  const handleViewProduct = () => {
    const target = getViewProductTarget(order)
    if (!target) {
      notify.error('No linked products found for this order.')
      return
    }

    if (target.type === 'direct') {
      const state = mergeOrderNavigationState(location.state, { returnTo: ordersReturnTo })
      navigate(buildViewProductPath(target.productId, target.orderId), state ? { state } : undefined)
      return
    }

    const state = mergeOrderNavigationState(location.state, { returnTo: ordersReturnTo })
    navigate(`/orders/${target.orderId}/products`, state ? { state } : undefined)
  }

  return (
    <div className={`flex ${align === 'end' ? 'justify-end' : 'justify-start'}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`inline-flex cursor-pointer items-center justify-center rounded-lg p-2 ring-1 transition-all ${
          open
            ? 'bg-brand-light/30 text-brand ring-brand/25 shadow-sm'
            : 'text-slate-500 ring-transparent hover:bg-slate-100 hover:text-slate-800'
        }`}
        aria-label={`Actions for ${order.productName || order.orderNumber}`}
      >
        <MoreHorizontal className="size-4" />
      </button>

      <PortalMenu
        open={open}
        onClose={close}
        triggerRef={triggerRef}
        menuWidth={260}
        className="overflow-hidden py-0 shadow-[0_16px_40px_rgba(15,23,42,0.12)]"
      >
        <div className="border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Order actions
          </p>
          <p className="mt-1 truncate text-sm font-bold text-slate-950">
            {order.productName || order.orderNumber}
          </p>
        </div>

        <div className="py-1">
          {!hideUpdateDeliveryStatus && onUpdateDeliveryStatus && (
            <OrderMenuAction
              icon={Truck}
              label="Update status"
              onClick={() => run(() => onUpdateDeliveryStatus(order))}
            />
          )}

          <OrderMenuAction
            icon={Printer}
            label="Print receipt"
            onClick={() => run(() => navigateWithListPayment(navigate, `/orders/${parentOrderId}/receipt`, order, { returnTo: ordersReturnTo }))}
          />

          {hasLinkedProducts && (
            <OrderMenuAction
              icon={Package}
              label="View product"
              onClick={() => run(handleViewProduct)}
            />
          )}
        </div>
      </PortalMenu>
    </div>
  )
}
