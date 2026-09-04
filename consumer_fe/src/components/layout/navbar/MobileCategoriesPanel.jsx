import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronRight, LayoutGrid, Search, Tag, X } from 'lucide-react'
import { Link } from 'react-router'
import { useNavbarCategoryMenu } from '../../../hooks/useNavbarCategoryMenu'
import { getCategoryImage } from '../../../utils/categoryDisplay'

const panelEase = [0.16, 1, 0.3, 1]

function visibleSubcategories(category) {
  return (category.subcategories ?? []).filter((sub) => sub.id !== 'all')
}

function CategoryThumb({ category }) {
  const image = category.image || getCategoryImage({ slug: category.id, name: category.label })

  return (
    <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200/80">
      {image ? (
        <img src={image} alt="" className="size-full object-contain p-1.5" loading="lazy" />
      ) : (
        <LayoutGrid className="size-5 text-slate-300" strokeWidth={1.6} aria-hidden />
      )}
    </span>
  )
}

function CategoryListSkeleton() {
  return (
    <div className="divide-y divide-slate-100" aria-hidden="true">
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="flex items-center gap-3 px-1 py-3">
          <span className="size-11 shrink-0 animate-pulse rounded-xl bg-slate-200/80" />
          <span className="h-3.5 flex-1 animate-pulse rounded bg-slate-200/80" />
          <span className="size-4 shrink-0 animate-pulse rounded bg-slate-200/70" />
        </div>
      ))}
    </div>
  )
}

function CategoryAccordionRow({ category, expanded, onToggle, onNavigate }) {
  const subs = visibleSubcategories(category)

  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center gap-3 px-1 py-3 text-left active:bg-slate-50"
      >
        <CategoryThumb category={category} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-slate-900">{category.label}</span>
          {subs.length > 0 ? (
            <span className="mt-0.5 block text-xs text-slate-500">
              {subs.length} {subs.length === 1 ? 'department' : 'departments'}
            </span>
          ) : null}
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-180 text-auth-primary' : ''}`}
          strokeWidth={2.25}
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
            <div className="mb-3 ml-14 space-y-0.5 rounded-xl bg-slate-50 p-1.5">
              <Link
                to={category.href}
                onClick={onNavigate}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-auth-primary"
              >
                Shop all {category.label}
                <ChevronRight className="size-3.5" strokeWidth={2.5} aria-hidden />
              </Link>
              {subs.map((sub) => (
                <Link
                  key={sub.id}
                  to={sub.href}
                  onClick={onNavigate}
                  className="block rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-white hover:text-slate-950"
                >
                  {sub.label}
                </Link>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function MobileCategoriesPanelContent({ onClose }) {
  const { menuItems, isLoading } = useNavbarCategoryMenu()
  const [query, setQuery] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  const filteredItems = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return menuItems

    return menuItems.filter((item) => {
      if (item.label.toLowerCase().includes(needle)) return true
      return visibleSubcategories(item).some((sub) => sub.label.toLowerCase().includes(needle))
    })
  }, [menuItems, query])

  useEffect(() => {
    if (filteredItems.length === 1) {
      setExpandedId(filteredItems[0].id)
      return
    }

    if (expandedId && !filteredItems.some((item) => item.id === expandedId)) {
      setExpandedId(null)
    }
  }, [expandedId, filteredItems])

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key !== 'Escape') return
      if (expandedId) setExpandedId(null)
      else onClose()
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [expandedId, onClose])

  const toggleCategory = (categoryId) => {
    setExpandedId((current) => (current === categoryId ? null : categoryId))
  }

  return (
    <motion.div
      id="mobile-categories-panel"
      role="dialog"
      aria-modal="true"
      aria-label="Browse categories"
      data-categories-panel
      initial={{ x: '-100%' }}
      animate={{ x: 0 }}
      exit={{ x: '-100%' }}
      transition={{ type: 'spring', damping: 34, stiffness: 360, mass: 0.85 }}
      className="fixed inset-0 z-[120] flex h-dvh w-full flex-col overflow-hidden bg-white lg:hidden"
    >
      <div className="flex shrink-0 flex-col border-b border-slate-200/80 bg-white px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-bold tracking-tight text-slate-900">Categories</h2>
            <p className="text-xs text-slate-500">Browse departments and jump to a listing</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close categories"
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200"
          >
            <X className="size-5" strokeWidth={2.25} />
          </button>
        </div>

        <label className="relative mt-3 block">
          <span className="sr-only">Find a category</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" strokeWidth={2.25} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find a category"
            className="h-10 w-full rounded-full border-0 bg-slate-100 pr-3 pl-10 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-auth-primary/30"
          />
        </label>

        <div className="mt-3 flex gap-2">
          <Link
            to="/categories"
            onClick={onClose}
            className="inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-slate-900 px-3 text-xs font-semibold text-white"
          >
            <LayoutGrid className="size-3.5" strokeWidth={2.25} />
            All categories
          </Link>
          <Link
            to="/promotions"
            onClick={onClose}
            className="inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-[#FFF4C2] px-3 text-xs font-semibold text-slate-900"
          >
            <Tag className="size-3.5 text-auth-primary" strokeWidth={2.25} />
            Promotions
          </Link>
        </div>
      </div>

      <div className="scrollbar-theme min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-1">
        {isLoading ? (
          <CategoryListSkeleton />
        ) : filteredItems.length === 0 ? (
          <div className="px-2 py-16 text-center">
            <p className="text-sm font-semibold text-slate-900">No matching categories</p>
            <p className="mt-1 text-xs text-slate-500">Try a different name, or browse all categories.</p>
          </div>
        ) : (
          <div>
            {filteredItems.map((category) => (
              <CategoryAccordionRow
                key={category.id}
                category={category}
                expanded={expandedId === category.id}
                onToggle={() => toggleCategory(category.id)}
                onNavigate={onClose}
              />
            ))}
          </div>
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
