import { useRef, useState } from 'react'
import { Eye, EyeOff, MoreHorizontal, Star, StarOff, Trash2 } from 'lucide-react'
import PortalMenu from '../common/PortalMenu'

export default function ReviewActions({ review, onView, onStatus, onFeatured, onRemove }) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)
  const name = review.shopperName || 'this review'
  const visible = review.status === 'visible'
  const featured = Boolean(review.featured)

  const run = (action) => {
    action?.(review)
    setOpen(false)
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for review from ${name}`}
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
          View review
        </button>
        <button
          type="button"
          role="menuitem"
          onClick={() => run(onStatus)}
          className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
        >
          {visible
            ? <EyeOff className="size-4" strokeWidth={2} />
            : <Eye className="size-4" strokeWidth={2} />}
          {visible ? 'Hide review' : 'Approve review'}
        </button>
        <button
          type="button"
          role="menuitem"
          onClick={() => run(onFeatured)}
          className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
        >
          {featured
            ? <StarOff className="size-4" strokeWidth={2} />
            : <Star className="size-4" strokeWidth={2} />}
          {featured ? 'Remove from featured' : 'Feature review'}
        </button>
        <div className="my-1 border-t border-slate-100" role="separator" />
        <button
          type="button"
          role="menuitem"
          onClick={() => run(onRemove)}
          className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50"
        >
          <Trash2 className="size-4" strokeWidth={2} />
          Remove review
        </button>
      </PortalMenu>
    </>
  )
}
