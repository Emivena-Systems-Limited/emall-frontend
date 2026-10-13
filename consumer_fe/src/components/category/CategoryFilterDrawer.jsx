import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import CategoryFilterPanelContent from './CategoryFilterPanelContent'

const drawerEase = [0.16, 1, 0.3, 1]

export default function CategoryFilterDrawer({
  isOpen,
  onClose,
  parentCategories = [],
  defaultCategorySlug,
  isLoading = false,
  isFacetsLoading = false,
  variant = 'category',
  facetOptions,
  resultCount = null,
  /** `drawer` = side panel (category/promotions). `sheet` = full-width listing filter. */
  presentation = 'drawer',
  layout = 'default',
}) {
  const isSheet = presentation === 'sheet'

  useEffect(() => {
    if (!isOpen) return undefined

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
  }, [isOpen, onClose])

  const resultsLabel = resultCount == null
    ? 'Show results'
    : `Show ${resultCount} Result${resultCount === 1 ? '' : 's'}`

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[130] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
        >
          <motion.button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-slate-950/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          <motion.aside
            className={
              isSheet
                ? 'absolute inset-x-0 bottom-0 flex h-[min(92dvh,100%)] max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-[0_-12px_40px_-16px_rgba(15,23,42,0.35)]'
                : 'absolute inset-y-0 left-0 flex h-dvh max-h-dvh w-[min(100vw-2.5rem,20rem)] flex-col overflow-hidden border-r border-slate-200/80 bg-white shadow-[8px_0_32px_-12px_rgba(15,23,42,0.28)]'
            }
            initial={isSheet ? { y: '100%' } : { x: '-100%' }}
            animate={isSheet ? { y: 0 } : { x: 0 }}
            exit={isSheet ? { y: '100%' } : { x: '-100%' }}
            transition={{ duration: 0.32, ease: drawerEase }}
          >
            {isSheet ? (
              <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-slate-200" aria-hidden />
            ) : null}

            <header className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-200/80 px-4 pt-3 pb-3.5">
              <h2 className="text-base font-bold tracking-tight text-slate-900">Filters</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close filters"
                className="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
              >
                <X className="size-5" strokeWidth={2.25} />
              </button>
            </header>

            <div data-scroll-root="" className="scrollbar-theme min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <CategoryFilterPanelContent
                parentCategories={parentCategories}
                defaultCategorySlug={defaultCategorySlug}
                isLoading={isLoading}
                isFacetsLoading={isFacetsLoading}
                showHeading={false}
                variant={variant}
                layout={layout}
                facetOptions={facetOptions}
              />
            </div>

            <footer className="shrink-0 border-t border-slate-200/80 bg-white px-4 pt-3 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={onClose}
                className="flex min-h-12 w-full items-center justify-center rounded-xl bg-nav-red px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-nav-red-deep"
              >
                {resultsLabel}
              </button>
            </footer>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
