import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { SlidersHorizontal, X } from 'lucide-react'
import CategoryFilterPanelContent from './CategoryFilterPanelContent'

const drawerEase = [0.16, 1, 0.3, 1]

export default function CategoryFilterDrawer({
  isOpen,
  onClose,
  parentCategories = [],
  defaultCategorySlug,
  defaultSubcategorySlug,
  isLoading = false,
  variant = 'category',
}) {
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

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-80 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <motion.button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          <motion.aside
            className="absolute inset-y-0 left-0 flex w-[min(100vw-2.5rem,20rem)] flex-col border-r border-slate-200/80 bg-white shadow-[8px_0_32px_-12px_rgba(15,23,42,0.28)]"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: drawerEase }}
          >
            <header className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-200/80 px-4 py-3.5">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-auth-primary/10 text-auth-primary">
                  <SlidersHorizontal className="size-4" strokeWidth={2} />
                </span>
                <h2 className="text-base font-bold tracking-tight text-slate-900">Filters</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close filters"
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
              >
                <X className="size-4" strokeWidth={2.25} />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <CategoryFilterPanelContent
                parentCategories={parentCategories}
                defaultCategorySlug={defaultCategorySlug}
                defaultSubcategorySlug={defaultSubcategorySlug}
                isLoading={isLoading}
                showHeading={false}
                variant={variant}
              />
            </div>

            <footer className="shrink-0 border-t border-slate-200/80 bg-slate-50/60 px-4 py-3.5">
              <button
                type="button"
                onClick={onClose}
                className="flex w-full items-center justify-center rounded-lg bg-auth-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-auth-primary-hover"
              >
                Show results
              </button>
            </footer>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
