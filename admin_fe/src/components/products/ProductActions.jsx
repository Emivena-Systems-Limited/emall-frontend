import { CheckCircle2, Eye, EyeOff, Pencil, Shield, Trash2 } from 'lucide-react'

export default function ProductActions({
  product,
  onView,
  onEdit,
  onStatus,
  onVisibility,
  onRemove,
}) {
  const name = product.name || 'this product'

  return (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onView?.(product)
        }}
        aria-label={`View ${name}`}
        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <Eye className="size-3.5" strokeWidth={2} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onEdit?.(product)
        }}
        aria-label={`Edit ${name}`}
        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <Pencil className="size-3.5" strokeWidth={2} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onStatus?.(product)
        }}
        aria-label={`Update review status for ${name}`}
        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-brand-light hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        {product.approvalStatus === 'approved' ? (
          <CheckCircle2 className="size-3.5" strokeWidth={2} aria-hidden="true" />
        ) : (
          <Shield className="size-3.5" strokeWidth={2} aria-hidden="true" />
        )}
      </button>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onVisibility?.(product)
        }}
        aria-label={product.isActive ? `Hide ${name} from shoppers` : `Show ${name} on the storefront`}
        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        {product.isActive ? (
          <EyeOff className="size-3.5" strokeWidth={2} aria-hidden="true" />
        ) : (
          <Eye className="size-3.5" strokeWidth={2} aria-hidden="true" />
        )}
      </button>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onRemove?.(product)
        }}
        aria-label={`Remove ${name}`}
        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <Trash2 className="size-3.5" strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  )
}
