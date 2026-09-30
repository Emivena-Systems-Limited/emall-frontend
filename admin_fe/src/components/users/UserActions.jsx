import { useRef, useState } from 'react'
import { Archive, Eye, MoreHorizontal, Power, ShoppingBag } from 'lucide-react'
import PortalMenu from '../common/PortalMenu'

const menuItemClass = 'flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950'

export default function UserActions({ user, onView, onViewOrders, onStatus, onArchive }) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)
  const name = user.name || 'this customer'
  const suspended = user.status === 'suspended'

  const run = (action) => {
    action?.(user)
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
          View customer
        </button>
        {onViewOrders && (
          <button type="button" role="menuitem" onClick={() => run(onViewOrders)} className={menuItemClass}>
            <ShoppingBag className="size-4" strokeWidth={2} />
            View orders
          </button>
        )}
        <div className="mt-1 border-t border-slate-100">
          <button
            type="button"
            role="menuitem"
            onClick={() => run(onStatus)}
            className={`flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-medium transition-colors ${suspended ? 'text-emerald-700 hover:bg-emerald-50' : 'text-rose-700 hover:bg-rose-50'}`}
          >
            <Power className="size-4" strokeWidth={2} />
            {suspended ? 'Reactivate account' : 'Suspend account'}
          </button>
          {onArchive && (
            <button
              type="button"
              role="menuitem"
              onClick={() => run(onArchive)}
              className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50"
            >
              <Archive className="size-4" strokeWidth={2} />
              Archive customer
            </button>
          )}
        </div>
      </PortalMenu>
    </>
  )
}
