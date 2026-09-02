import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2, Copy, Loader2, Pencil, Package } from 'lucide-react'
import ProductThumbnail from '../dashboard/ProductThumbnail'

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

function ModalBackdrop({ isLoading, onClose }) {
  return (
    <button
      type="button"
      aria-label="Close dialog"
      disabled={isLoading}
      onClick={onClose}
      className="absolute inset-0 cursor-pointer bg-slate-950/50 backdrop-blur-sm disabled:cursor-not-allowed"
    />
  )
}

function ProductPreview({ product }) {
  return (
    <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3">
      <ProductThumbnail src={product.image} alt={product.name} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-900">{product.name}</p>
        <p className="mt-0.5 truncate text-xs text-slate-500">SKU: {product.sku || '—'}</p>
      </div>
    </div>
  )
}

export function DuplicateProductConfirmModal({
  open,
  product,
  onClose,
  onConfirm,
  isLoading = false,
}) {
  useModalLock(open, isLoading, onClose)

  if (!open || !product) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="duplicate-product-confirm-title"
    >
      <ModalBackdrop isLoading={isLoading} onClose={onClose} />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_32px_80px_rgba(15,23,42,0.28)]">
        <div className="border-b border-slate-100 bg-gradient-to-b from-brand-light/30 to-white px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-brand/10 text-brand ring-1 ring-brand/15">
            <Copy className="size-5" strokeWidth={2} />
          </span>
          <h2 id="duplicate-product-confirm-title" className="mt-4 text-lg font-bold tracking-tight text-slate-950">
            Duplicate this product?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            A copy will be created with the same details, images, and variations. You can edit the duplicate afterwards.
          </p>
          <ProductPreview product={product} />
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
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(199,59,45,0.22)] transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Duplicating…
              </>
            ) : (
              <>
                <Copy className="size-4" />
                Duplicate product
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export function DuplicateProductSuccessModal({
  open,
  sourceProduct,
  duplicatedProduct,
  onEditDetails,
  onKeepDetails,
}) {
  useModalLock(open, false, onKeepDetails)

  if (!open || !duplicatedProduct) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="duplicate-product-success-title"
    >
      <ModalBackdrop isLoading={false} onClose={onKeepDetails} />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_32px_80px_rgba(15,23,42,0.28)]">
        <div className="border-b border-slate-100 bg-gradient-to-b from-emerald-50/80 to-white px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200/80">
            <CheckCircle2 className="size-5" strokeWidth={2} />
          </span>
          <h2 id="duplicate-product-success-title" className="mt-4 text-lg font-bold tracking-tight text-slate-950">
            Product duplicated successfully
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {sourceProduct
              ? `A copy of “${sourceProduct.name}” is now in your catalogue.`
              : 'Your product copy is now in your catalogue.'}
          </p>
          <ProductPreview product={duplicatedProduct} />
        </div>

        <div className="flex flex-col-reverse gap-3 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onKeepDetails}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:border-slate-300"
          >
            <Package className="size-4" />
            Keep details
          </button>
          <button
            type="button"
            onClick={onEditDetails}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(199,59,45,0.22)] transition-colors hover:bg-brand-hover"
          >
            <Pencil className="size-4" />
            Edit details
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
