import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, Trash2 } from 'lucide-react'
import ProductThumbnail from '../dashboard/ProductThumbnail'

const PREVIEW_LIMIT = 4

function useModalLock(open, isLoading, onClose) {
  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isLoading) onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, isLoading, onClose])
}

export default function BulkDeleteProductsModal({
  open,
  products = [],
  onClose,
  onConfirm,
  isLoading = false,
}) {
  useModalLock(open, isLoading, onClose)

  if (!open || products.length === 0) return null

  const count = products.length
  const previewProducts = products.slice(0, PREVIEW_LIMIT)
  const remainingCount = Math.max(0, count - PREVIEW_LIMIT)

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bulk-delete-products-title"
    >
      <button
        type="button"
        aria-label="Close dialog"
        disabled={isLoading}
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-slate-950/50 backdrop-blur-sm disabled:cursor-not-allowed"
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_32px_80px_rgba(15,23,42,0.28)]">
        <div className="border-b border-slate-100 bg-gradient-to-b from-red-50/80 to-white px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-red-100 text-red-600 ring-1 ring-red-200/80">
            <Trash2 className="size-5" strokeWidth={2} />
          </span>
          <h2 id="bulk-delete-products-title" className="mt-4 text-lg font-bold tracking-tight text-slate-950">
            Delete {count} product{count === 1 ? '' : 's'}?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            The selected product{count === 1 ? '' : 's'} will be permanently removed from your catalogue. This action cannot be undone.
          </p>

          <div className="mt-4 max-h-48 space-y-2 overflow-y-auto rounded-xl border border-red-100 bg-red-50/40 p-2">
            {previewProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-2.5 rounded-lg border border-white/80 bg-white px-2.5 py-2"
              >
                <ProductThumbnail src={product.image} alt={product.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-900">{product.name}</p>
                  <p className="truncate text-[11px] text-slate-500">SKU: {product.sku || '—'}</p>
                </div>
              </div>
            ))}
            {remainingCount > 0 && (
              <p className="px-2 py-1 text-center text-xs font-semibold text-slate-500">
                and {remainingCount} more product{remainingCount === 1 ? '' : 's'}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(220,38,38,0.22)] transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 className="size-4" />
                Delete {count} product{count === 1 ? '' : 's'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
