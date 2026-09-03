import { useRef, useState } from 'react'
import { Eye, MoreHorizontal, Package, Store } from 'lucide-react'
import PortalMenu from '../common/PortalMenu'

export default function InventoryActions({ item, onView, onOpenListing, onOpenStore }) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)
  const name = item.productName || 'this stock record'

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
          View stock
        </button>
        {item.productId ? (
          <button
            type="button"
            role="menuitem"
            onClick={() => run(onOpenListing)}
            className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
          >
            <Package className="size-4" strokeWidth={2} />
            Open listing
          </button>
        ) : null}
        {item.vendorId ? (
          <button
            type="button"
            role="menuitem"
            onClick={() => run(onOpenStore)}
            className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
          >
            <Store className="size-4" strokeWidth={2} />
            Open store
          </button>
        ) : null}
      </PortalMenu>
    </>
  )
}
