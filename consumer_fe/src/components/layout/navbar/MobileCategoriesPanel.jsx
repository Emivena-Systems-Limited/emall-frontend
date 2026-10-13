import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ChevronDown, LayoutGrid, X } from 'lucide-react'
import { Link } from 'react-router'
import { useNavbarCategoryMenu } from '../../../hooks/useNavbarCategoryMenu'
import NavbarSearch from './NavbarSearch'

const panelEase = [0.16, 1, 0.3, 1]

function visibleSubcategories(category) {
  return (category.subcategories ?? []).filter((sub) => sub.id !== 'all')
}

function CategoryListSkeleton() {
  return (
    <div className="divide-y divide-slate-200" aria-hidden="true">
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="flex items-center justify-between px-4 py-3.5">
          <span className="h-3.5 w-36 animate-pulse rounded bg-slate-200" />
          <span className="size-4 animate-pulse rounded bg-slate-200" />
        </div>
      ))}
    </div>
  )
}

function CategoryAccordionRow({ category, expanded, onToggle, onNavigate }) {
  const subs = visibleSubcategories(category)

  return (
    <div className="border-b border-slate-200">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
      >
        <span className="text-sm font-medium text-slate-900">{category.label}</span>
        <ChevronDown
          className={`size-4 shrink-0 text-slate-500 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          strokeWidth={2}
          aria-hidden
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: panelEase }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <Link
                to={category.href}
                onClick={onNavigate}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-nav-red"
              >
                <ArrowRight className="size-3.5" strokeWidth={2.25} aria-hidden />
                View all in {category.label}
              </Link>

              {subs.length > 0 ? (
                <ul className="mt-3 space-y-3 pl-1">
                  {subs.map((sub) => (
                    <li key={sub.id}>
                      <Link
                        to={sub.href}
                        onClick={onNavigate}
                        className="flex items-start gap-2.5 text-sm text-slate-700"
                      >
                        <span className="mt-[0.45rem] size-1 shrink-0 rounded-full bg-slate-800" aria-hidden />
                        <span>{sub.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function MobileCategoriesPanelContent({ onClose }) {
  const { menuItems, isLoading } = useNavbarCategoryMenu()
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const toggleCategory = (categoryId) => {
    setExpandedId((current) => (current === categoryId ? null : categoryId))
  }

  return (
    <motion.div
      id="mobile-categories-panel"
      role="dialog"
      aria-modal="true"
      aria-label="All Categories"
      data-categories-panel
      initial={{ x: '-100%' }}
      animate={{ x: 0 }}
      exit={{ x: '-100%' }}
      transition={{ type: 'spring', damping: 34, stiffness: 360, mass: 0.85 }}
      className="fixed inset-y-0 left-0 z-[120] flex w-[min(22.5rem,calc(100vw-4.75rem))] flex-col overflow-hidden bg-white shadow-xl lg:hidden"
    >
      <div className="flex shrink-0 items-center gap-2 px-4 pt-[max(0.85rem,env(safe-area-inset-top))] pb-3">
        <LayoutGrid className="size-5 shrink-0 text-nav-red" strokeWidth={2.25} aria-hidden />
        <h2 className="min-w-0 truncate text-base font-bold text-slate-900">All Categories</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close categories"
          className="ml-auto inline-flex size-8 shrink-0 items-center justify-center text-slate-700"
        >
          <X className="size-5" strokeWidth={2} />
        </button>
      </div>

      <div className="shrink-0 px-3 pb-3">
        <NavbarSearch compact />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain border-t border-slate-200">
        {isLoading ? (
          <CategoryListSkeleton />
        ) : menuItems.length === 0 ? (
          <p className="px-4 py-10 text-sm text-slate-500">Categories are unavailable right now.</p>
        ) : (
          menuItems.map((category) => (
            <CategoryAccordionRow
              key={category.id}
              category={category}
              expanded={expandedId === category.id}
              onToggle={() => toggleCategory(category.id)}
              onNavigate={onClose}
            />
          ))
        )}
      </div>
    </motion.div>
  )
}

export default function MobileCategoriesPanel({ open, onClose }) {
  useEffect(() => {
    if (!open) return undefined

    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <AnimatePresence>
      {open ? (
        <motion.button
          key="categories-overlay"
          type="button"
          aria-label="Close categories"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: panelEase }}
          className="fixed inset-0 z-[115] bg-slate-950/40 lg:hidden"
          onClick={onClose}
        />
      ) : null}

      {open ? <MobileCategoriesPanelContent key="categories-panel" onClose={onClose} /> : null}
    </AnimatePresence>
  )
}
