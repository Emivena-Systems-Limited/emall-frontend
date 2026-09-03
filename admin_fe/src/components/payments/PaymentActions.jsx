import { useRef, useState } from 'react'
import { CreditCard, Eye, MoreHorizontal, RotateCcw, ShoppingCart } from 'lucide-react'
import PortalMenu from '../common/PortalMenu'
import { canRefundPayment, canUpdatePaymentStatus } from '../../constants/payments'

export default function PaymentActions({
  item,
  onView,
  onStatus,
  onRefund,
  onOpenOrder,
}) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)
  const name = item.orderNumber || item.reference || 'this payment'
  const showRefund = canRefundPayment(item)
  const showStatus = canUpdatePaymentStatus(item)

  const run = (action) => {
    action?.(item)
    setOpen(false)
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${name}`}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          setOpen((value) => !value)
        }}
        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <MoreHorizontal className="size-4" strokeWidth={2} aria-hidden="true" />
      </button>

      <PortalMenu
        open={open}
        onClose={() => setOpen(false)}
        triggerRef={triggerRef}
        menuWidth={220}
      >
        <button
          type="button"
          role="menuitem"
          onClick={() => run(onView)}
          className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
        >
          <Eye className="size-4" strokeWidth={2} />
          View payment
        </button>
        {item.orderId ? (
          <button
            type="button"
            role="menuitem"
            onClick={() => run(onOpenOrder)}
            className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
          >
            <ShoppingCart className="size-4" strokeWidth={2} />
            Open order
          </button>
        ) : null}
        {showStatus ? (
          <button
            type="button"
            role="menuitem"
            onClick={() => run(onStatus)}
            className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
          >
            <CreditCard className="size-4" strokeWidth={2} />
            Update status
          </button>
        ) : null}
        {showRefund ? (
          <>
            <div className="my-1 border-t border-slate-100" role="separator" />
            <button
              type="button"
              role="menuitem"
              onClick={() => run(onRefund)}
              className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50"
            >
              <RotateCcw className="size-4" strokeWidth={2} />
              Issue refund
            </button>
          </>
        ) : null}
      </PortalMenu>
    </>
  )
}
