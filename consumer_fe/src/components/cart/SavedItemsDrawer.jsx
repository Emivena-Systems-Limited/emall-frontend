import { forwardRef, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router'
import { useSelector } from 'react-redux'
import { AnimatePresence, motion } from 'framer-motion'
import { Bookmark, ShoppingBag, X } from 'lucide-react'
import { useOptionalSavedItemsDrawer, useSavedItemsDrawer } from '../../context/SavedItemsDrawerContext'
import { useCartActions } from '../../hooks/useCartActions'
import { selectSavedCartItems } from '../../store/slices/cartSlice'
import { formatCedi } from '../../utils/formatCurrency'
import { formatCartItemOptions, resolveCartItemDisplayImage } from '../../utils/normalizeCart'
import CartSectionEmptyState from './CartSectionEmptyState'

const drawerEase = [0.16, 1, 0.3, 1]
const FLOATING_TRIGGER_SCROLL_PX = 140

function resolveProductHref(item) {
  return item.href?.replace(/^\/products\//, '/') ?? '/'
}

function SavedDrawerItem({ item, onRestore, onDelete, onNavigate }) {
  const productHref = resolveProductHref(item)
  const displayImage = resolveCartItemDisplayImage(item)
  const optionLabel = formatCartItemOptions(item)

  return (
    <article className="rounded-xl bg-slate-50/90 p-2.5 ring-1 ring-slate-200/60">
      <div className="flex gap-2.5">
        <Link
          to={productHref}
          onClick={onNavigate}
          className="size-14 shrink-0 overflow-hidden rounded-lg bg-white ring-1 ring-slate-200/70"
        >
          <img
            src={displayImage}
            alt=""
            className="size-full object-contain p-0.5"
            loading="lazy"
          />
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            to={productHref}
            onClick={onNavigate}
            className="line-clamp-2 text-[0.8125rem] font-semibold leading-snug text-slate-900 transition-colors hover:text-auth-primary"
          >
            {item.name}
          </Link>
          {optionLabel ? (
            <p className="mt-0.5 truncate text-xs font-medium text-slate-500" title={optionLabel}>
              {optionLabel}
            </p>
          ) : null}
          {item.seller && (
            <p className="mt-0.5 text-[0.6875rem] text-slate-500">
              Sold by <span className="font-semibold text-slate-700">{item.seller}</span>
            </p>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="text-xs font-bold tabular-nums text-auth-primary">
              {formatCedi(item.price)}
            </p>
            <p className="text-xs font-semibold text-slate-600">Qty: {item.quantity}</p>
          </div>
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold">
        <button
          type="button"
          onClick={() => onRestore(item.id ?? item.key)}
          className="rounded-md bg-auth-primary px-3 py-1.5 text-white transition-colors hover:bg-auth-primary-hover"
        >
          Add to cart
        </button>
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="text-slate-600 underline transition-colors hover:text-auth-primary"
        >
          Delete
        </button>
      </div>
    </article>
  )
}

export const SavedItemsTrigger = forwardRef(function SavedItemsTrigger(
  { className = '' },
  ref,
) {
  const savedItemsDrawer = useOptionalSavedItemsDrawer()
  const savedItems = useSelector(selectSavedCartItems)
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)

  if (!isAuthenticated || !savedItemsDrawer) return null

  const { openSavedItemsDrawer } = savedItemsDrawer
  const count = savedItems.length

  return (
    <button
      ref={ref}
      type="button"
      onClick={openSavedItemsDrawer}
      className={`inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-auth-primary hover:text-auth-primary sm:px-4 sm:text-sm ${className}`}
    >
      <Bookmark className="size-4 shrink-0" strokeWidth={2} />
      <span>Saved items</span>
      {count > 0 && (
        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-auth-primary px-1.5 py-0.5 text-[0.6875rem] font-bold text-white">
          {count}
        </span>
      )}
    </button>
  )
})

/** Fixed bottom-left control shown after scrolling on the cart page. */
export function SavedItemsFloatingTrigger({ elevateForMobileBar = false }) {
  const savedItemsDrawer = useOptionalSavedItemsDrawer()
  const savedItems = useSelector(selectSavedCartItems)
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const [scrolledPast, setScrolledPast] = useState(false)

  useEffect(() => {
    const updateVisibility = () => {
      setScrolledPast(window.scrollY > FLOATING_TRIGGER_SCROLL_PX)
    }

    updateVisibility()
    window.addEventListener('scroll', updateVisibility, { passive: true })
    return () => window.removeEventListener('scroll', updateVisibility)
  }, [])

  if (!isAuthenticated || !savedItemsDrawer) return null

  const { isOpen, openSavedItemsDrawer } = savedItemsDrawer
  const count = savedItems.length
  const show = scrolledPast && !isOpen

  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          onClick={openSavedItemsDrawer}
          aria-label={count > 0 ? `Saved items, ${count}` : 'Saved items'}
          initial={{ opacity: 0, y: 16, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.94 }}
          transition={{ duration: 0.22, ease: drawerEase }}
          className={`fixed left-4 z-50 hidden items-center gap-2 rounded-full border border-slate-200/90 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-800 shadow-[0_10px_28px_-8px_rgba(15,23,42,0.28)] ring-1 ring-slate-900/5 transition-colors hover:border-auth-primary hover:text-auth-primary sm:left-6 lg:inline-flex ${
            elevateForMobileBar ? 'bottom-24 lg:bottom-8' : 'bottom-6 lg:bottom-8'
          }`}
        >
          <span className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-auth-primary/10 text-auth-primary">
            <Bookmark className="size-4" strokeWidth={2.25} />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-auth-primary px-1 py-px text-[0.625rem] font-bold leading-none text-white">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </span>
          <span className="pr-0.5">Saved items</span>
        </motion.button>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export default function SavedItemsDrawer() {
  const { isOpen, closeSavedItemsDrawer } = useSavedItemsDrawer()
  const savedItems = useSelector(selectSavedCartItems)
  const { restoreSavedItem, deleteSaved, clearSaved } = useCartActions()

  useEffect(() => {
    if (!isOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeSavedItemsDrawer()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, closeSavedItemsDrawer])

  const handleNavigate = () => {
    closeSavedItemsDrawer()
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-130" role="dialog" aria-modal="true" aria-label="Saved items">
          <motion.button
            type="button"
            aria-label="Close saved items"
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeSavedItemsDrawer}
          />

          <motion.aside
            className="absolute inset-y-0 right-0 flex w-[min(100vw-0.75rem,26rem)] flex-col border-l border-slate-200/80 bg-white shadow-[-8px_0_32px_-12px_rgba(15,23,42,0.28)]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: drawerEase }}
          >
            <header className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-200/80 px-4 py-3.5">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-auth-primary/10 text-auth-primary">
                  <Bookmark className="size-4" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <h2 className="text-base font-bold tracking-tight text-slate-900">Saved items</h2>
                  <p className="text-xs text-slate-500">
                    {savedItems.length} {savedItems.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeSavedItemsDrawer}
                aria-label="Close saved items"
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
              >
                <X className="size-4" strokeWidth={2.25} />
              </button>
            </header>

            {savedItems.length === 0 ? (
              <div className="flex flex-1 flex-col px-3 py-4">
                <CartSectionEmptyState
                  icon={ShoppingBag}
                  eyebrow="Nothing saved"
                  title="No saved items yet"
                  description="Save cart items for later and they will appear here when you're ready to buy."
                  ctaLabel="Continue Shopping"
                  ctaHref="/"
                  compact
                />
              </div>
            ) : (
              <>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3">
                  <ul className="space-y-2.5">
                    {savedItems.map((item) => (
                      <li key={item.key ?? item.id}>
                        <SavedDrawerItem
                          item={item}
                          onRestore={restoreSavedItem}
                          onDelete={deleteSaved}
                          onNavigate={handleNavigate}
                        />
                      </li>
                    ))}
                  </ul>
                </div>

                <footer className="shrink-0 border-t border-slate-200/80 bg-slate-50/60 px-4 py-3.5">
                  <button
                    type="button"
                    onClick={clearSaved}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-auth-primary hover:text-auth-primary"
                  >
                    Clear saved items
                  </button>
                  <button
                    type="button"
                    onClick={closeSavedItemsDrawer}
                    className="mt-2 w-full py-1 text-center text-xs font-medium text-slate-500 transition-colors hover:text-auth-primary"
                  >
                    Close
                  </button>
                </footer>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
