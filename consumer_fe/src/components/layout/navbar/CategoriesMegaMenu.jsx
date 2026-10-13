import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import Container from '../Container'
import { useNavbarCategoryMenu } from '../../../hooks/useNavbarCategoryMenu'

const panelEase = [0.16, 1, 0.3, 1]

function visibleSubcategories(category) {
  return (category?.subcategories ?? []).filter((sub) => sub.id !== 'all')
}

function MegaMenuSkeleton() {
  return (
    <div className="grid grid-cols-[18.5rem_minmax(0,1fr)]" aria-hidden="true">
      <div className="space-y-1 border-r border-slate-200 py-3">
        {Array.from({ length: 10 }, (_, index) => (
          <div key={index} className="px-4 py-2">
            <span className="block h-3.5 w-36 animate-pulse rounded bg-slate-200" />
          </div>
        ))}
      </div>
      <div className="px-8 py-6">
        <span className="block h-5 w-40 animate-pulse rounded bg-slate-200" />
        <span className="mt-3 block h-3.5 w-16 animate-pulse rounded bg-slate-200" />
        <div className="mt-8 grid grid-cols-2 gap-x-12 gap-y-4">
          {Array.from({ length: 6 }, (_, index) => (
            <span key={index} className="block h-3.5 w-28 animate-pulse rounded bg-slate-200" />
          ))}
        </div>
      </div>
    </div>
  )
}

function CategoryDetail({ category, onNavigate }) {
  const subcategories = visibleSubcategories(category)

  return (
    <motion.div
      key={category.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16, ease: panelEase }}
      className="px-6 py-5"
    >
      <h2 className="text-base font-bold tracking-tight text-slate-900">{category.label}</h2>
      <Link
        to={category.href}
        onClick={onNavigate}
        className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-nav-red transition-colors hover:text-nav-red-deep"
      >
        View all
        <ArrowRight className="size-3.5" strokeWidth={2.25} aria-hidden />
      </Link>

      {subcategories.length > 0 ? (
        <ul className="mt-6 grid grid-cols-2 gap-x-12 gap-y-4">
          {subcategories.map((sub) => (
            <li key={sub.id}>
              <Link
                to={sub.href}
                onClick={onNavigate}
                className="flex items-start gap-2 text-xs text-slate-800 transition-colors hover:text-nav-red"
              >
                <span className="mt-[0.45rem] size-1 shrink-0 rounded-full bg-current" aria-hidden />
                <span>{sub.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </motion.div>
  )
}

export default function CategoriesMegaMenu({ open, onClose }) {
  const { menuItems, isLoading, defaultCategoryId } = useNavbarCategoryMenu()
  const [activeCategoryId, setActiveCategoryId] = useState(null)

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
    if (!open || !defaultCategoryId) return
    setActiveCategoryId(defaultCategoryId)
  }, [open, defaultCategoryId])

  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.div
            key="mega-overlay"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: panelEase }}
            className="fixed inset-0 z-40 hidden bg-slate-900/20 backdrop-blur-[1px] lg:block"
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            id="categories-mega-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Browse categories"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: panelEase }}
            className="pointer-events-none absolute inset-x-0 top-full z-[120] hidden lg:block"
          >
            <Container className="pointer-events-none py-0">
              <div
                data-categories-panel
                className="pointer-events-auto w-full max-w-3xl overflow-hidden rounded-b-xl border border-slate-200 border-t-0 bg-white shadow-[0_18px_40px_-24px_rgba(15,23,42,0.35)]"
              >
                {isLoading ? (
                  <MegaMenuSkeleton />
                ) : menuItems.length === 0 ? (
                  <div className="px-6 py-8 text-sm text-slate-500">
                    Categories are unavailable right now.
                  </div>
                ) : (
                  <div className="flex max-h-[min(34rem,calc(100vh-7.5rem))] flex-col">
                    <div className="grid min-h-0 flex-1 grid-cols-[18.5rem_minmax(0,1fr)] overflow-hidden">
                      <nav
                        aria-label="Product categories"
                        className="overflow-x-hidden overflow-y-auto border-r border-slate-200 py-2"
                      >
                        <ul>
                          {menuItems.map((category) => {
                            const isActive = category.id === activeCategory?.id

                            return (
                              <li key={category.id} className="relative">
                                <Link
                                  to={category.href}
                                  onClick={onClose}
                                  onMouseEnter={() => setActiveCategoryId(category.id)}
                                  onFocus={() => setActiveCategoryId(category.id)}
                                  aria-current={isActive ? 'true' : undefined}
                                  className={`block px-4 py-2 text-xs transition-colors ${
                                    isActive
                                      ? 'font-medium text-nav-red'
                                      : 'text-slate-800 hover:text-slate-950'
                                  }`}
                                >
                                  {category.label}
                                </Link>
                                {isActive ? (
                                  <span
                                    aria-hidden="true"
                                    className="absolute top-1/2 right-0 h-4 w-[3px] -translate-y-1/2 bg-nav-red"
                                  />
                                ) : null}
                              </li>
                            )
                          })}
                        </ul>
                      </nav>

                      <div className="min-h-[16rem] overflow-y-auto">
                        {activeCategory ? (
                          <AnimatePresence mode="wait">
                            <CategoryDetail
                              key={activeCategory.id}
                              category={activeCategory}
                              onNavigate={onClose}
                            />
                          </AnimatePresence>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex shrink-0 justify-end border-t border-slate-200 px-5 py-2.5">
                      <Link
                        to="/categories"
                        onClick={onClose}
                        className="inline-flex items-center gap-1 text-xs font-medium text-nav-red transition-colors hover:text-nav-red-deep"
                      >
                        Browse all categories
                        <ArrowRight className="size-3.5" strokeWidth={2.25} aria-hidden />
                      </Link>
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
