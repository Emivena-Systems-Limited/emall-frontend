import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { AnimatePresence, motion } from 'framer-motion'
import { ShoppingBag, ShoppingCart } from 'lucide-react'
import { useMiniCart } from '../../context/MiniCartContext'
import { selectCartCount, selectCartItems } from '../../store/slices/cartSlice'
import { formatCedi } from '../../utils/formatCurrency'
import { formatCartItemOptions, resolveCartItemDisplayImage } from '../../utils/normalizeCart'

const panelEase = [0.16, 1, 0.3, 1]

function MiniCartItem({ item, onNavigate }) {
  const productHref = item.href?.replace(/^\/products\//, '/') ?? '/'
  const displayImage = resolveCartItemDisplayImage(item)
  const optionLabel = formatCartItemOptions(item) || 'Default'
  const quantity = Math.max(1, Number(item.quantity) || 1)

  return (
    <li>
      <Link
        to={productHref}
        onClick={onNavigate}
        className="flex items-start gap-3 py-3 transition-colors hover:bg-slate-50/80"
      >
        <span className="size-12 shrink-0 overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-200/70 sm:size-14">
          <img
            src={displayImage}
            alt=""
            className="size-full object-contain p-0.5"
            loading="lazy"
          />
        </span>

        <span className="min-w-0 flex-1">
          <span className="line-clamp-1 text-sm font-semibold text-slate-900">
            {item.name}
          </span>
          <span className="mt-0.5 block truncate text-xs text-slate-500">
            {optionLabel}
          </span>
          <span className="mt-1 block text-sm font-bold tabular-nums text-slate-900">
            {formatCedi(item.price)}
            <span className="font-semibold text-slate-700"> × {quantity}</span>
          </span>
        </span>
      </Link>
    </li>
  )
}

function EmptyMiniCart({ onClose }) {
  return (
    <div className="px-4 py-8 text-center">
      <span className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <ShoppingBag className="size-5" strokeWidth={1.75} />
      </span>
      <p className="mt-3 text-sm font-bold text-slate-900">Your cart is empty</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">
        Add items to see them here.
      </p>
      <button
        type="button"
        onClick={onClose}
        className="mt-4 rounded-full bg-auth-primary px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-auth-primary-hover"
      >
        Continue shopping
      </button>
    </div>
  )
}

export default function MiniCartDrawer() {
  const { isOpen, closeMiniCart } = useMiniCart()
  const navigate = useNavigate()
  const panelRef = useRef(null)
  const items = useSelector(selectCartItems)
  const itemCount = useSelector(selectCartCount)

  useEffect(() => {
    if (!isOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeMiniCart()
    }

    const handlePointerDown = (event) => {
      if (event.target.closest('[data-mini-cart-toggle]')) return
      if (panelRef.current?.contains(event.target)) return
      closeMiniCart()
    }

    window.addEventListener('keydown', handleKeyDown)
    const timer = window.setTimeout(() => {
      document.addEventListener('pointerdown', handlePointerDown, true)
    }, 0)

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('pointerdown', handlePointerDown, true)
    }
  }, [isOpen, closeMiniCart])

  const handleViewCart = () => {
    closeMiniCart()
    navigate('/cart')
  }

  const previewItems = items.slice(0, 3)
  const remainingCount = Math.max(0, items.length - previewItems.length)

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-label="My cart"
          data-mini-cart-panel
          className="fixed top-[4.25rem] right-3 z-[140] w-[min(calc(100vw-1.5rem),20rem)] overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_16px_40px_-16px_rgba(15,23,42,0.35)] sm:right-6 lg:top-[5.25rem]"
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.2, ease: panelEase }}
        >
          <header className="flex items-center justify-between gap-3 px-4 py-3.5">
            <h2 className="text-base font-bold tracking-tight text-slate-950">My Cart</h2>
            <span className="flex min-w-5 items-center justify-center rounded-full bg-auth-primary px-1.5 py-0.5 text-[0.6875rem] font-bold leading-none text-white">
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          </header>

          <div className="border-t border-slate-200" />

          {items.length === 0 ? (
            <EmptyMiniCart onClose={closeMiniCart} />
          ) : (
            <>
              <ul className="divide-y divide-slate-100 px-4">
                {previewItems.map((item) => (
                  <MiniCartItem
                    key={item.id}
                    item={item}
                    onNavigate={closeMiniCart}
                  />
                ))}
              </ul>

              {remainingCount > 0 ? (
                <p className="border-t border-slate-100 px-4 py-2 text-center text-xs font-medium text-slate-500">
                  +{remainingCount} more in cart
                </p>
              ) : null}

              <div className="border-t border-slate-200 px-4 py-3.5">
                <button
                  type="button"
                  onClick={handleViewCart}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-auth-primary px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-auth-primary-hover"
                >
                  <ShoppingCart className="size-4" strokeWidth={2.25} aria-hidden />
                  View Cart
                </button>
              </div>
            </>
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
