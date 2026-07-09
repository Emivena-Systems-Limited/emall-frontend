import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  PackageSearch,
  Sparkles,
  Tag,
  X,
} from 'lucide-react'
import { Link } from 'react-router'
import { useNavbarCategoryMenu } from '../../../hooks/useNavbarCategoryMenu'
import { formatCedi } from '../../../utils/formatCurrency'

const panelEase = [0.16, 1, 0.3, 1]

function CategoryGridCard({ category, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(category)}
      className="group flex flex-col items-start gap-2.5 rounded-xl border border-slate-200/80 bg-white p-3 text-left shadow-sm transition-all active:scale-[0.98]"
    >
      <span className="flex size-9 items-center justify-center rounded-lg bg-auth-primary/10 text-auth-primary transition-colors group-hover:bg-auth-primary group-hover:text-white">
        <Sparkles className="size-4" strokeWidth={2} />
      </span>
      <span className="text-sm font-semibold leading-snug text-slate-800">{category.label}</span>
      <span className="mt-auto flex items-center gap-1 text-xs font-medium text-slate-400">
        Explore
        <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </button>
  )
}

function FeaturedCarouselEmptyState() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-300 ring-1 ring-slate-200">
        <PackageSearch className="size-4.5" strokeWidth={1.75} aria-hidden />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-800">No featured products yet</p>
        <p className="mt-0.5 text-xs text-slate-500">Curated picks coming soon.</p>
      </div>
    </div>
  )
}

function FeaturedCarousel({ products, onNavigate }) {
  if (!products.length) {
    return <FeaturedCarouselEmptyState />
  }

  return (
    <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 overscroll-x-contain [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
      {products.map((product) => (
        <Link
          key={product.id}
          to={product.href?.replace(/^\/products\//, '/')}
          onClick={onNavigate}
          className="w-38 shrink-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white sm:w-40"
        >
          <div className="aspect-square overflow-hidden bg-slate-50">
            <img src={product.image} alt={product.name} className="size-full object-cover" loading="lazy" />
          </div>
          <div className="space-y-1 p-2.5">
            <p className="truncate text-xs font-medium text-slate-800">{product.name}</p>
            <div className="flex flex-wrap items-baseline gap-1.5">
              {product.compareAt ? (
                <>
                  <span className="text-[0.625rem] text-slate-400 line-through">
                    {formatCedi(product.compareAt)}
                  </span>
                  <span className="text-xs font-bold text-auth-primary">{formatCedi(product.price)}</span>
                </>
              ) : (
                <span className="text-xs font-bold text-auth-primary">{formatCedi(product.price)}</span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

function MobilePromoEmptyState({ categoryHref, categoryLabel, onNavigate }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-dashed border-[#E8D48A] bg-[#FFF9E6]">
      <div className="flex flex-col items-center px-4 py-8 text-center">
        <div className="flex size-11 items-center justify-center rounded-full bg-white/80 text-[#C9A227] shadow-sm">
          <Tag className="size-5" strokeWidth={1.75} aria-hidden />
        </div>
        <p className="mt-3 text-sm font-bold text-slate-900">No promotions yet</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">
          Special offers for {categoryLabel ?? 'this category'} are coming soon.
        </p>
        <Link
          to={categoryHref}
          onClick={onNavigate}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-auth-primary px-4 py-3 text-xs font-bold tracking-[0.08em] text-white"
        >
          Browse category
          <ArrowRight className="size-3.5" strokeWidth={2.5} />
        </Link>
      </div>
    </div>
  )
}

function MobilePromoCard({ promo, onNavigate }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-[#FFF4C2]">
      <div className="relative h-36 overflow-hidden">
        <img src={promo.image} alt={promo.productName} className="size-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-linear-to-t from-[#FFF4C2] via-[#FFF4C2]/20 to-transparent" />
      </div>
      <div className="space-y-2 px-4 pb-4">
        <p className="text-base font-bold text-slate-900">{promo.discount}</p>
        <p className="text-xs leading-relaxed text-slate-600">{promo.headline}</p>
        <p className="text-xs font-medium text-slate-500">
          {promo.priceLabel}{' '}
          <span className="font-bold text-slate-900">{formatCedi(promo.price)}</span>
        </p>
        <Link
          to={promo.href?.replace(/^\/products\//, '/')}
          onClick={onNavigate}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-auth-primary px-4 py-3 text-xs font-bold tracking-[0.08em] text-white"
        >
          {promo.cta}
          <ArrowRight className="size-3.5" strokeWidth={2.5} />
        </Link>
      </div>
    </div>
  )
}

function MobileCategoriesPanelContent({ onClose }) {
  const { menuItems, isLoading, getDefaultSubcategoryId } = useNavbarCategoryMenu()
  const [view, setView] = useState('grid')
  const [activeCategory, setActiveCategory] = useState(null)
  const [activeSubcategoryId, setActiveSubcategoryId] = useState('all')

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        if (view === 'detail') setView('grid')
        else onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose, view])

  const openCategory = (category) => {
    setActiveCategory(category)
    setActiveSubcategoryId(getDefaultSubcategoryId(category))
    setView('detail')
  }

  return (
    <>
      <motion.button
        type="button"
        aria-label="Close categories"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-x-0 bottom-0 top-[7.25rem] z-55 bg-slate-950/40 lg:hidden"
        onClick={onClose}
      />

      <motion.div
        id="mobile-categories-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Browse categories"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ duration: 0.34, ease: panelEase }}
        className="fixed inset-x-0 bottom-0 top-[7.25rem] z-70 flex flex-col overflow-hidden rounded-t-2xl bg-slate-50 shadow-[0_-20px_60px_-10px_rgba(15,23,42,0.35)] lg:hidden"
      >
        <div className="flex shrink-0 flex-col items-center border-b border-slate-200/80 bg-white px-4 pb-3 pt-3">
          <span className="mb-3 h-1 w-10 rounded-full bg-slate-200" aria-hidden="true" />
          <div className="flex w-full items-center gap-3">
            {view === 'detail' ? (
              <button
                type="button"
                onClick={() => setView('grid')}
                className="inline-flex size-9 items-center justify-center rounded-full bg-slate-100 text-slate-700"
                aria-label="Back to categories"
              >
                <ArrowLeft className="size-4" strokeWidth={2.25} />
              </button>
            ) : (
              <span className="flex size-9 items-center justify-center rounded-full bg-auth-primary/10 text-auth-primary">
                <Sparkles className="size-4" strokeWidth={2.25} />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-slate-400">
                {view === 'grid' ? 'Browse' : 'Category'}
              </p>
              <h2 className="truncate text-base font-bold text-slate-900">
                {view === 'grid' ? 'Shop by Category' : (activeCategory?.label ?? 'Category')}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close categories"
              className="inline-flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200"
            >
              <X className="size-5" strokeWidth={2.25} />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          {isLoading ? (
            <p className="py-6 text-center text-sm text-slate-500">Loading categories...</p>
          ) : (
          <AnimatePresence mode="wait">
            {view === 'grid' ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.24, ease: panelEase }}
                className="grid grid-cols-2 gap-2.5 sm:grid-cols-3"
              >
                {menuItems.map((category) => (
                  <CategoryGridCard key={category.id} category={category} onSelect={openCategory} />
                ))}
              </motion.div>
            ) : activeCategory ? (
              <motion.div
                key={`detail-${activeCategory.id}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.24, ease: panelEase }}
                className="space-y-5"
              >
                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 overscroll-x-contain [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
                  {menuItems.map((category) => {
                    const isActive = category.id === activeCategory.id

                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => openCategory(category)}
                        className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                          isActive
                            ? 'bg-auth-primary text-white'
                            : 'bg-white text-slate-600 ring-1 ring-slate-200'
                        }`}
                      >
                        {category.label}
                      </button>
                    )
                  })}
                </div>

                <section>
                  <div className="mb-2.5 flex items-center justify-between">
                    <h3 className="text-xs font-bold tracking-[0.12em] text-slate-400 uppercase">
                      Subcategories
                    </h3>
                    <Link
                      to={activeCategory.href}
                      onClick={onClose}
                      className="text-xs font-semibold text-auth-primary"
                    >
                      View all
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeCategory.subcategories.map((sub) => {
                      const isActive = sub.id === activeSubcategoryId

                      return (
                        <Link
                          key={sub.id}
                          to={sub.href}
                          onClick={onClose}
                          onMouseEnter={() => setActiveSubcategoryId(sub.id)}
                          className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-slate-900 text-white'
                              : 'bg-white text-slate-700 ring-1 ring-slate-200'
                          }`}
                        >
                          {sub.label}
                        </Link>
                      )
                    })}
                  </div>
                </section>

                <section>
                  <h3 className="mb-2.5 text-xs font-bold tracking-[0.12em] text-slate-400 uppercase">
                    {activeCategory.featuredTitle ?? 'Featured Products'}
                  </h3>
                  <FeaturedCarousel
                    products={activeCategory.featured ?? []}
                    onNavigate={onClose}
                  />
                </section>

                <section>
                  {activeCategory.promo ? (
                    <MobilePromoCard promo={activeCategory.promo} onNavigate={onClose} />
                  ) : (
                    <MobilePromoEmptyState
                      categoryHref={activeCategory.href}
                      categoryLabel={activeCategory.label}
                      onNavigate={onClose}
                    />
                  )}
                </section>
              </motion.div>
            ) : null}
          </AnimatePresence>
          )}
        </div>
      </motion.div>
    </>
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
      {open && <MobileCategoriesPanelContent onClose={onClose} />}
    </AnimatePresence>
  )
}
