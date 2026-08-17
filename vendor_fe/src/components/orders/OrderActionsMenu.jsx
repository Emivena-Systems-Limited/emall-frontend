import { useMemo, useRef, useState } from 'react'
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

function OrderMenuAction({ icon: Icon, tone, label, helper, helperTitle, onClick }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="group flex w-full cursor-pointer items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
    >
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform group-hover:scale-[1.03] ${tone}`}
      >
        <Icon className="size-4" strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1 overflow-hidden pt-0.5">
        <span className="block truncate text-sm font-semibold text-slate-900">{label}</span>
        <span
          className="mt-0.5 block line-clamp-2 text-xs leading-snug text-slate-500"
          title={helperTitle ?? helper}
        >
          {helper}
        </span>
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

  const viewProductMeta = useMemo(() => {
    if (orderProducts.length === 1) {
      const fullName = orderProducts[0].productName
      return {
        helper: 'Open this product in your catalogue.',
        helperTitle: fullName || undefined,
      }
    }

    return {
      helper: `Choose from ${orderProducts.length} products in this order.`,
      helperTitle: undefined,
    }
  }, [orderProducts])

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
        menuWidth={300}
        className="overflow-hidden py-0 shadow-[0_20px_50px_rgba(15,23,42,0.14)]"
      >
        <div className="border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white px-4 py-3.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Order actions
          </p>
          <p className="mt-1 truncate text-sm font-bold text-slate-950">
            {order.productName || order.orderNumber}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Update fulfilment, print a receipt, or open the linked product.
          </p>
        </div>

        <div className="py-1.5">
          {!hideUpdateDeliveryStatus && onUpdateDeliveryStatus && (
            <OrderMenuAction
              icon={Truck}
              tone="bg-sky-50 text-sky-700 ring-sky-100"
              label="Update delivery status"
              helper="Change fulfilment progress for this product."
              onClick={() => run(() => onUpdateDeliveryStatus(order))}
            />
          )}

          <OrderMenuAction
            icon={Printer}
            tone="bg-slate-100 text-slate-700 ring-slate-200"
            label="Print Receipt"
            helper="Preview, download, or print a receipt for this purchase."
            onClick={() => run(() => navigateWithListPayment(navigate, `/orders/${parentOrderId}/receipt`, order, { returnTo: ordersReturnTo }))}
          />

          {hasLinkedProducts && (
            <>
              <div className="mx-3 my-1 border-t border-slate-100" role="separator" />
              <OrderMenuAction
                icon={Package}
                tone="bg-violet-50 text-violet-700 ring-violet-100"
                label="View Product"
                helper={viewProductMeta.helper}
                helperTitle={viewProductMeta.helperTitle}
                onClick={() => run(handleViewProduct)}
              />
            </>
          )}
        </div>
      </PortalMenu>
    </div>
  )
}
