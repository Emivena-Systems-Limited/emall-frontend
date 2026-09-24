import { useRef, useState } from 'react'
import { CheckCircle2, Eye, EyeOff, Layers3, MessageSquareText, MoreHorizontal, Shield } from 'lucide-react'
import PortalMenu from '../common/PortalMenu'

const menuItemClass = 'flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950'

export default function ProductActions({
  product,
  onView,
  onStatus,
  onVisibility,
  onViewReason,
  onViewVariations,
}) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)
  const name = product.name || 'this product'
  const approved = product.approvalStatus === 'approved'

  const run = (action) => {
    action?.(product)
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
        menuWidth={210}
      >
        <button type="button" role="menuitem" onClick={() => run(onView)} className={menuItemClass}>
          <Eye className="size-4" strokeWidth={2} />
          View product
        </button>
        {product.approvalStatus === 'rejected' && (
          <button type="button" role="menuitem" onClick={() => run(onViewReason)} className={menuItemClass}>
            <MessageSquareText className="size-4 text-red-600" strokeWidth={2} />
            View rejection reason
          </button>
        )}
        {!product.isSimpleListing && (
          <button type="button" role="menuitem" onClick={() => run(onViewVariations)} className={menuItemClass}>
            <Layers3 className="size-4" strokeWidth={2} />
            View variations
          </button>
        )}
        <button type="button" role="menuitem" onClick={() => run(onStatus)} className={menuItemClass}>
          {approved
            ? <CheckCircle2 className="size-4" strokeWidth={2} />
            : <Shield className="size-4" strokeWidth={2} />}
          Review status
        </button>
        <button type="button" role="menuitem" onClick={() => run(onVisibility)} className={menuItemClass}>
          {product.isActive
            ? <EyeOff className="size-4" strokeWidth={2} />
            : <Eye className="size-4" strokeWidth={2} />}
          {product.isActive ? 'Hide from shoppers' : 'Show on storefront'}
        </button>
      </PortalMenu>
    </>
  )
}
