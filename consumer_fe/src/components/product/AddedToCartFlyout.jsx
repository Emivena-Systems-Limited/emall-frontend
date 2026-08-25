import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ShoppingBag, X } from 'lucide-react'

const drawerEase = [0.16, 1, 0.3, 1]

export default function AddedToCartFlyout({
  open,
  product,
  image: imageProp,
  variantLabel,
  onClose,
  onViewCart,
}) {
  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  const image = imageProp || product?.image || product?.gallery?.[0] || ''
  const name = product?.title ?? product?.name ?? 'Product'

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[150]" role="dialog" aria-modal="true" aria-label="Added to cart">
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-slate-950/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-5 shadow-[0_-12px_40px_rgba(15,23,42,0.16)] sm:left-1/2 sm:max-w-md sm:-translate-x-1/2 sm:rounded-2xl sm:bottom-8"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.32, ease: drawerEase }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200 sm:hidden" aria-hidden />

            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Check className="size-5" strokeWidth={2.5} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-950">Added to cart</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close added to cart confirmation"
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mb-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              {image ? (
                <img src={image} alt="" className="size-16 shrink-0 rounded-lg bg-white object-contain p-1" />
              ) : (
                <div className="size-16 shrink-0 rounded-lg bg-white" />
              )}
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-semibold text-slate-900">{name}</p>
                {variantLabel ? (
                  <p className="mt-0.5 truncate text-xs text-slate-500">{variantLabel}</p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={onViewCart}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-auth-primary px-5 py-3 text-sm font-bold text-white hover:bg-auth-primary-hover"
              >
                <ShoppingBag className="size-4" />
                View cart
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-center text-sm font-bold text-slate-700 hover:border-slate-400"
              >
                Continue shopping
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
