import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ChevronRight, PackageSearch, Tag } from 'lucide-react'
import { Link } from 'react-router'
import Container from '../Container'
import { useNavbarCategoryMenu } from '../../../hooks/useNavbarCategoryMenu'
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

function FeaturedProductsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-white text-slate-300 shadow-sm ring-1 ring-slate-200">
        <PackageSearch className="size-5" strokeWidth={1.75} aria-hidden />
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-800">No featured products yet</p>
      <p className="mt-1 max-w-[12rem] text-xs leading-relaxed text-slate-500">
        Curated picks for this category will appear here soon.
      </p>
    </div>
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

function PromoEmptyState({ categoryHref, categoryLabel, onNavigate }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-dashed border-[#E8D48A] bg-[#FFF9E6]">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-white/80 text-[#C9A227] shadow-sm">
          <Tag className="size-5" strokeWidth={1.75} aria-hidden />
        </div>
        <p className="mt-3 text-sm font-bold text-slate-900">No promotions yet</p>
        <p className="mt-1 max-w-[10rem] text-xs leading-relaxed text-slate-600">
          Special offers and deals for {categoryLabel ?? 'this category'} are coming soon.
        </p>
        <Link
          to={categoryHref}
          onClick={onNavigate}
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-auth-primary px-4 py-2.5 text-xs font-bold tracking-[0.08em] text-white transition-colors hover:bg-auth-primary-hover"
        >
          Browse category
          <ArrowRight className="size-3.5" strokeWidth={2.5} />
        </Link>
      </div>
    </div>
  )
}

function CategoryPanelContent({ category, activeSubcategoryId, onSubcategoryChange, onNavigate }) {
  const featured = category.featured ?? []
  const hasFeatured = featured.length > 0
  const hasPromo = Boolean(category.promo)

  return (
    <motion.div
      key={category.id}
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.22, ease: panelEase }}
      className="grid min-h-88 grid-cols-[minmax(14rem,max-content)_minmax(0,1fr)_17.5rem] xl:grid-cols-[minmax(15rem,max-content)_minmax(0,1fr)_19rem]"
    >
      <nav aria-label="Subcategories" className="shrink-0 border-r border-slate-100 py-2 pr-2">
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
                  className={`flex items-center whitespace-nowrap rounded-lg px-3 py-2.5 text-sm transition-colors ${
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
          {category.featuredTitle ?? 'FEATURED PRODUCTS'}
        </p>
        <div className="mt-2.5 space-y-2">
          {hasFeatured ? (
            featured.map((product) => (
              <FeaturedProductCard key={product.id} product={product} onNavigate={onNavigate} />
            ))
          ) : (
            <FeaturedProductsEmptyState />
          )}
        </div>
      </div>

      <div className="p-3 pl-4">
        {hasPromo ? (
          <PromoBanner promo={category.promo} onNavigate={onNavigate} />
        ) : (
          <PromoEmptyState
            categoryHref={category.href}
            categoryLabel={category.label}
            onNavigate={onNavigate}
          />
        )}
      </div>
    </motion.div>
  )
}

export default function CategoriesMegaMenu({ open, onClose }) {
  const { menuItems, isLoading, defaultCategoryId, getDefaultSubcategoryId } = useNavbarCategoryMenu()
  const [activeCategoryId, setActiveCategoryId] = useState(null)
  const [activeSubcategoryId, setActiveSubcategoryId] = useState('all')

  const activeCategory =
    menuItems.find((item) => item.id === activeCategoryId) ?? menuItems[0]

  useEffect(() => {
    if (!open) return undefined

    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [open, onClose])

  useEffect(() => {
    if (open && defaultCategoryId) {
      const category = menuItems.find((item) => item.id === defaultCategoryId) ?? menuItems[0]
      setActiveCategoryId(category?.id ?? null)
      setActiveSubcategoryId(getDefaultSubcategoryId(category))
    }
  }, [open, defaultCategoryId, menuItems, getDefaultSubcategoryId])

  const handleCategoryEnter = (category) => {
    setActiveCategoryId(category.id)
    setActiveSubcategoryId(getDefaultSubcategoryId(category))
  }

  return (
    <>
      {open && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 hidden bg-slate-900/20 backdrop-blur-[1px] lg:block"
        />
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            id="categories-mega-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Browse categories"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.12, ease: panelEase } }}
            transition={{ duration: 0.18, ease: panelEase }}
            className="pointer-events-none absolute inset-x-0 top-full z-50 hidden lg:block"
          >
            <Container className="pointer-events-none py-0">
              <div
                data-categories-panel
                className="pointer-events-auto overflow-hidden rounded-b-2xl border border-slate-100 border-t-0 bg-white shadow-[0_28px_60px_-20px_rgba(15,23,42,0.22)]"
              >
                {isLoading ? (
                  <div className="px-6 py-8 text-sm text-slate-500">Loading categories...</div>
                ) : (
                  <div className="grid grid-cols-[minmax(14rem,max-content)_minmax(0,1fr)]">
                    <nav aria-label="Product categories" className="shrink-0 border-r border-slate-100 py-3 pr-1">
                      <ul className="space-y-0.5">
                        {menuItems.map((category) => {
                          const isActive = category.id === activeCategoryId

                          return (
                            <li key={category.id}>
                              <Link
                                to={category.href}
                                onClick={onClose}
                                onMouseEnter={() => handleCategoryEnter(category)}
                                onFocus={() => handleCategoryEnter(category)}
                                className={`group flex items-center justify-between gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors ${
                                  isActive
                                    ? 'bg-slate-100 font-medium text-slate-900'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                              >
                                <span>{category.label}</span>
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
                      {activeCategory ? (
                        <AnimatePresence mode="wait">
                          <CategoryPanelContent
                            key={activeCategory.id}
                            category={activeCategory}
                            activeSubcategoryId={activeSubcategoryId}
                            onSubcategoryChange={setActiveSubcategoryId}
                            onNavigate={onClose}
                          />
                        </AnimatePresence>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
