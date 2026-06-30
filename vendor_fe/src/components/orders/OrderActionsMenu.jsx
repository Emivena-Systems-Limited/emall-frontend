import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Eye, MoreHorizontal, Package, Printer, RefreshCw } from 'lucide-react'
import PortalMenu from '../common/PortalMenu'
import { ORDER_STATUSES } from '../../constants/orders'
import notify from '../../lib/notify'
import {
  buildViewProductPath,
  getUniqueOrderProducts,
  getViewProductTarget,
} from '../../utils/orderProductNavigation'

function OrderMenuAction({ icon: Icon, tone, label, helper, onClick }) {
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
      <span className="min-w-0 flex-1 pt-0.5">
        <span className="block text-sm font-semibold text-slate-900">{label}</span>
        <span className="mt-0.5 block text-xs leading-snug text-slate-500">{helper}</span>
      </span>
    </button>
  )
}

export default function OrderActionsMenu({
  order,
  onPrint,
  onUpdateStatus,
  align = 'end',
  hideViewDetails = false,
}) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)
  const orderProducts = getUniqueOrderProducts(order)
  const hasLinkedProducts = orderProducts.length > 0
  const currentStatusLabel = ORDER_STATUSES[order.orderStatus]?.label ?? order.orderStatus

  const viewProductHelper = useMemo(() => {
    if (orderProducts.length === 1) {
      return `Open “${orderProducts[0].productName}” in your catalogue.`
    }

    return `Choose from ${orderProducts.length} products included in this order.`
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
      navigate(buildViewProductPath(target.productId, target.orderId))
      return
    }

    navigate(`/orders/${target.orderId}/products`)
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
        aria-label={`Actions for order ${order.orderNumber}`}
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
          <p className="mt-1 text-sm font-bold text-slate-950">{order.orderNumber}</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Manage fulfilment, receipts, and linked products for this order.
          </p>
        </div>

        <div className="py-1.5">
          {!hideViewDetails && (
            <OrderMenuAction
              icon={Eye}
              tone="bg-cyan-50 text-cyan-700 ring-cyan-100"
              label="View Details"
              helper="See customer info, delivery address, and ordered items."
              onClick={() => run(() => navigate(`/orders/${order.id}`))}
            />
          )}

          <OrderMenuAction
            icon={Printer}
            tone="bg-slate-100 text-slate-700 ring-slate-200"
            label="Print Receipt"
            helper="Open a printable receipt you can save or send to the customer."
            onClick={() => run(() => onPrint(order))}
          />

          <OrderMenuAction
            icon={RefreshCw}
            tone="bg-amber-50 text-amber-700 ring-amber-100"
            label="Update Status"
            helper={`Currently “${currentStatusLabel}”. Move this order to the next fulfilment step.`}
            onClick={() => run(() => onUpdateStatus(order))}
          />

          {hasLinkedProducts && (
            <>
              <div className="mx-3 my-1 border-t border-slate-100" role="separator" />
              <OrderMenuAction
                icon={Package}
                tone="bg-violet-50 text-violet-700 ring-violet-100"
                label="View Product"
                helper={viewProductHelper}
                onClick={() => run(handleViewProduct)}
              />
            </>
          )}
        </div>
      </PortalMenu>
    </div>
  )
}
