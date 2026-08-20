import { motion } from 'framer-motion'
import { ShoppingBag, X } from 'lucide-react'
import { formatCedi } from '../../utils/formatCurrency'
import { formatCartItemOptions } from '../../utils/normalizeCart'
import { clearBuyNowItem } from '../../utils/buyNowItem'

export default function BuyNowAuthResume({ item, onCancel }) {
  if (!item) return null

  const options = formatCartItemOptions(item)
  const quantity = Math.max(1, Number(item.quantity) || 1)
  const unitPrice = Number(item.price)
  const lineTotal = Number.isFinite(unitPrice) ? unitPrice * quantity : null
  const image = item.variantImage || item.image

  const handleCancel = () => {
    clearBuyNowItem()
    onCancel?.()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="mb-4 mt-4 overflow-hidden rounded-2xl border border-auth-primary/15 bg-linear-to-r from-[#fff7ed] via-white to-slate-50 p-2.5 shadow-[0_12px_28px_-18px_rgba(199,59,45,0.35)] sm:mb-5 sm:p-3"
    >
      <div className="flex items-center gap-3">
        <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-slate-200/80">
          {image ? (
            <img src={image} alt="" className="size-full object-contain p-1" />
          ) : (
            <span className="flex size-full items-center justify-center text-auth-primary">
              <ShoppingBag className="size-5" strokeWidth={1.75} aria-hidden="true" />
            </span>
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-auth-primary">
            <ShoppingBag className="size-3.5 shrink-0" strokeWidth={2.25} aria-hidden="true" />
            <p className="text-[10px] font-bold uppercase tracking-[0.16em]">
              Held for checkout
            </p>
          </div>
          <p className="mt-0.5 truncate text-sm font-bold text-slate-900">{item.name}</p>
          <p className="truncate text-xs text-slate-500">
            {[options, `Qty ${quantity}`, lineTotal != null ? formatCedi(lineTotal) : null]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>

        <button
          type="button"
          onClick={handleCancel}
          aria-label="Cancel this purchase"
          className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <X className="size-3.5" strokeWidth={2.25} aria-hidden="true" />
          Cancel
        </button>
      </div>
    </motion.div>
  )
}
