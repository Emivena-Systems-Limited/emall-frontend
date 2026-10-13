import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ShoppingCart, X } from 'lucide-react'
import { formatCedi } from '../../utils/formatCurrency'

const ease = [0.16, 1, 0.3, 1]

export default function AddedToCartFlyout({
  open,
  product,
  image: imageProp,
  variantLabel,
  brand,
  price,
  onClose,
  onCheckout,
}) {
  const navigate = useNavigate()

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
  const brandLabel = String(brand ?? product?.brand ?? product?.brandName ?? '').trim()
  const optionLine = variantLabel || 'Color: Default'
  const amount = price ?? product?.price

  const handleCheckout = () => {
    onClose?.()
    if (onCheckout) {
      onCheckout()
      return
    }
    navigate('/checkout')
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[150] flex items-end justify-center p-3 sm:items-center sm:p-6">
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Added to cart"
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-[0_24px_80px_-24px_rgba(15,23,42,0.45)]"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.28, ease }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 bg-emerald-50 px-4 py-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                <Check className="size-4" strokeWidth={3} />
              </span>
              <p className="min-w-0 flex-1 text-sm font-semibold text-slate-900">Added to Cart!</p>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close added to cart confirmation"
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-white/80 hover:text-slate-800"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 px-4 py-4">
              {image ? (
                <img
                  src={image}
                  alt=""
                  className="size-[4.5rem] shrink-0 rounded-xl bg-slate-50 object-contain p-1.5 ring-1 ring-slate-100"
                />
              ) : (
                <div className="size-[4.5rem] shrink-0 rounded-xl bg-slate-50 ring-1 ring-slate-100" />
              )}
              <div className="min-w-0 flex-1">
                {brandLabel ? (
                  <p className="truncate text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                    {brandLabel}
                  </p>
                ) : null}
                <p className="line-clamp-2 text-sm leading-snug font-bold text-slate-950">{name}</p>
                <p className="mt-0.5 truncate text-xs text-slate-500">{optionLine}</p>
                {amount != null ? (
                  <p className="mt-1.5 text-base font-bold tabular-nums text-slate-950">{formatCedi(amount)}</p>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 px-4 pb-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleCheckout}
                className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-nav-red px-4 text-sm font-semibold text-white transition hover:bg-nav-red-deep"
              >
                <ShoppingCart className="size-4" strokeWidth={2.25} />
                Proceed to Checkout
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl bg-slate-100 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Continue Shopping
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
