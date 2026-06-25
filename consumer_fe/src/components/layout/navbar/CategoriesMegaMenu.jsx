import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import Container from '../Container'
import {
  categoryMenuItems,
  DEFAULT_CATEGORY_ID,
  DEFAULT_SUBCATEGORY_ID,
} from '../../../constants/categoriesMenu'
import { formatCedi } from '../../../utils/formatCurrency'

const panelEase = [0.16, 1, 0.3, 1]

function FeaturedProductCard({ product, onNavigate }) {
  return (
    <Link
      to={product.href?.replace(/^\/products\//, '/')}
      onClick={onNavigate}
      className="group flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white p-2 transition-all hover:border-slate-300 hover:shadow-sm"
    >
      <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-slate-50">
        <img
          src={product.image}
          alt={product.name}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800">{product.name}</p>
        <div className="mt-0.5 flex flex-wrap items-baseline gap-2">
          {product.compareAt ? (
            <>
              <span className="text-xs text-slate-400 line-through">
                {formatCedi(product.compareAt)}
              </span>
              <span className="text-sm font-semibold text-auth-primary">
                {formatCedi(product.price)}
              </span>
            </>
          ) : (
            <span className="text-sm font-semibold text-auth-primary">
              {formatCedi(product.price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

function PromoBanner({ promo, onNavigate }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-[#FFF4C2]">
      <div className="relative h-40 overflow-hidden sm:h-44">
        <img
          src={promo.image}
          alt={promo.productName}
          className="size-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#FFF4C2] via-transparent to-transparent" />
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-1">
        <p className="text-lg font-bold tracking-tight text-slate-900">{promo.discount}</p>
        <p className="mt-2 text-[0.8125rem] leading-relaxed text-slate-600">{promo.headline}</p>

        <div className="mt-4">
          <p className="text-xs font-medium text-slate-500">{promo.priceLabel}</p>
          <div className="mt-1.5 inline-flex rounded-lg bg-white px-3 py-1.5 shadow-sm">
            <span className="text-sm font-bold text-slate-900">
              {formatCedi(promo.price)}
            </span>
          </div>
        </div>

        <Link
          to={promo.href?.replace(/^\/products\//, '/')}
          onClick={onNavigate}
          className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-auth-primary px-4 py-3 text-xs font-bold tracking-[0.08em] text-white transition-colors hover:bg-auth-primary-hover"
        >
          {promo.cta}
          <ArrowRight className="size-3.5" strokeWidth={2.5} />
        </Link>
      </div>
    </div>
  )
}

function CategoryPanelContent({ category, activeSubcategoryId, onSubcategoryChange, onNavigate }) {
  return (
    <motion.div
      key={category.id}
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.22, ease: panelEase }}
      className="grid min-h-88 grid-cols-[9.5rem_minmax(0,1fr)_17.5rem] xl:grid-cols-[10rem_minmax(0,1fr)_19rem]"
    >
      <nav aria-label="Subcategories" className="border-r border-slate-100 py-2 pr-1">
        <ul className="space-y-0.5">
          {category.subcategories.map((sub) => {
            const isActive = sub.id === activeSubcategoryId

            return (
              <li key={sub.id}>
                <Link
                  to={sub.href}
                  onClick={onNavigate}
                  onMouseEnter={() => onSubcategoryChange(sub.id)}
                  onFocus={() => onSubcategoryChange(sub.id)}
                  className={`flex items-center rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? 'bg-slate-100 font-semibold text-slate-900'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {sub.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-r border-slate-100 px-4 py-4">
        <p className="text-[0.6875rem] font-bold tracking-[0.14em] text-slate-400">
          {category.featuredTitle}
        </p>
        <div className="mt-2.5 space-y-2">
          {category.featured.map((product) => (
            <FeaturedProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
        </div>
      </div>

      <div className="p-3 pl-4">
        <PromoBanner promo={category.promo} onNavigate={onNavigate} />
      </div>
    </motion.div>
  )
}

export default function CategoriesMegaMenu({ open, onClose }) {
  const [activeCategoryId, setActiveCategoryId] = useState(DEFAULT_CATEGORY_ID)
  const [activeSubcategoryId, setActiveSubcategoryId] = useState(DEFAULT_SUBCATEGORY_ID)

  const activeCategory =
    categoryMenuItems.find((item) => item.id === activeCategoryId) ?? categoryMenuItems[0]

  useEffect(() => {
    if (!open) return undefined

    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [open, onClose])

  useEffect(() => {
    if (open) {
      setActiveCategoryId(DEFAULT_CATEGORY_ID)
      setActiveSubcategoryId(DEFAULT_SUBCATEGORY_ID)
    }
  }, [open])

  const handleCategoryEnter = (category) => {
    setActiveCategoryId(category.id)
    setActiveSubcategoryId(category.subcategories[1]?.id ?? category.subcategories[0]?.id ?? 'all')
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close categories menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 hidden bg-slate-900/20 backdrop-blur-[1px] lg:block"
            onClick={onClose}
          />

          <motion.div
            id="categories-mega-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Browse categories"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28, ease: panelEase }}
            className="absolute inset-x-0 top-full z-50 hidden lg:block"
          >
            <Container className="py-0">
              <div className="overflow-hidden rounded-b-2xl border border-slate-100 border-t-0 bg-white shadow-[0_28px_60px_-20px_rgba(15,23,42,0.22)]">
                <div className="grid grid-cols-[10.5rem_minmax(0,1fr)] xl:grid-cols-[11rem_minmax(0,1fr)]">
                <nav aria-label="Product categories" className="border-r border-slate-100 py-3 pr-1">
                  <ul className="space-y-0.5">
                    {categoryMenuItems.map((category) => {
                      const isActive = category.id === activeCategoryId

                      return (
                        <li key={category.id}>
                          <Link
                            to={category.href}
                            onClick={onClose}
                            onMouseEnter={() => handleCategoryEnter(category)}
                            onFocus={() => handleCategoryEnter(category)}
                            className={`group flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                              isActive
                                ? 'bg-slate-100 font-medium text-slate-900'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                          >
                            <span className="min-w-0 truncate">{category.label}</span>
                            {isActive && (
                              <ChevronRight
                                className="size-4 shrink-0 text-slate-400"
                                strokeWidth={2.25}
                              />
                            )}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </nav>

                <div className="min-w-0 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <CategoryPanelContent
                      key={activeCategory.id}
                      category={activeCategory}
                      activeSubcategoryId={activeSubcategoryId}
                      onSubcategoryChange={setActiveSubcategoryId}
                      onNavigate={onClose}
                    />
                  </AnimatePresence>
                </div>
                </div>
              </div>
            </Container>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
