import { useRef, useState } from 'react'
import { Ban, Eye, MoreHorizontal, Package } from 'lucide-react'
import { canCancelOrder } from '../../constants/adminOrders'
import PortalMenu from '../common/PortalMenu'

const menuItemClass = 'flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950'
const disabledItemClass = 'flex w-full cursor-not-allowed items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-medium text-slate-400'

export default function OrderActions({
  order,
  onView,
  onViewProduct,
  onCancel,
}) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)
  const name = order.orderNumber || 'this order'
  const canCancel = canCancelOrder(order)

  const run = (action) => {
    action?.(order)
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
        <button type="button" role="menuitem" onClick={() => run(onView)} className={menuItemClass}>
          <Eye className="size-4" strokeWidth={2} />
          View order
        </button>
        {onViewProduct ? (
          <button type="button" role="menuitem" onClick={() => run(onViewProduct)} className={menuItemClass}>
            <Package className="size-4" strokeWidth={2} />
            View product details
          </button>
        ) : null}
        <div className="-mb-1 border-t border-slate-100 bg-slate-50">
          <button
            type="button"
            role="menuitem"
            disabled={!canCancel}
            onClick={() => {
              if (canCancel) run(onCancel)
            }}
            className={canCancel
              ? 'flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-50 hover:text-rose-800'
              : disabledItemClass}
          >
            <Ban className="size-4" strokeWidth={2} />
            {canCancel ? 'Cancel order' : 'Cannot cancel'}
          </button>
        </div>
      </PortalMenu>
    </>
  )
}
