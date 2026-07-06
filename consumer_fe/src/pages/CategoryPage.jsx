import { useEffect, useMemo } from 'react'
import { useParams } from 'react-router'
import { motion } from 'framer-motion'
import CategoryEmptyState from '../components/category/CategoryEmptyState'
import SiteLayout from '../components/layout/SiteLayout'
import CategoryPageContainer from '../components/category/CategoryPageContainer'
import CategoryBreadcrumb from '../components/category/CategoryBreadcrumb'
import ProductCard from '../components/shared/ProductCard'
import SubcategoryExplorer from '../components/category/SubcategoryExplorer'
import CategoryFilterBar from '../components/category/CategoryFilterBar'
import CategoryFilterDrawer from '../components/category/CategoryFilterDrawer'
import { useLandingPageData } from '../hooks/useLandingPageData'
import { useCategoryCatalog } from '../hooks/useCategoryCatalog'
import { useCategoryProductFilters } from '../hooks/useCategoryProductFilters'
import { normalizeLandingProducts } from '../utils/normalizeLandingProducts'
import { findCategoryBySlug, getSubcategoriesForParent } from '../utils/normalizeCategories'
import {
  getStaticSubcategoriesForSlug,
  mapSubcategoryForDisplay,
  resolveCategoryBySlug,
} from '../utils/categoryDisplay'
import { topCategories } from '../constants/topCategories'

const ease = [0.16, 1, 0.3, 1]
const STICKY_OFFSET = 'top-[57px] sm:top-[65px]'

function slugify(str = '') {
  return str
    .toLowerCase()
    .replace(/[&]/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function matchScore(product, slug, label, subSlug) {
  let score = 0
  const fields = [
    product.category,
    product.categorySlug,
    product.subcategory,
    product.subcategorySlug,
    product.storeName,
    product.title,
    product.name,
    product.description,
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase())

  const slugText = slug.replace(/-/g, ' ')
  const labelWords = label.toLowerCase().split(/\s+/)

  for (const field of fields) {
    if (field.includes(slugText)) score += 3
    if (slugify(field) === slug) score += 5
    for (const word of labelWords) {
      if (word.length > 2 && field.includes(word)) score += 1
    }
  }

  if (subSlug) {
    const subSlugText = subSlug.replace(/-/g, ' ')
    if (product.subcategorySlug === subSlug) score += 12
    if (slugify(product.subcategory ?? '') === subSlug) score += 10
    if (String(product.subcategory ?? '').toLowerCase().includes(subSlugText)) score += 6
    if (String(product.categorySlug ?? '').toLowerCase().includes(subSlugText)) score += 2
  }

  return score
}

function formatSlugLabel(slug = '') {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export default function CategoryPage() {
  const { slug, subSlug } = useParams()
  const isSubcategoryView = Boolean(subSlug)
  const { data: landingData, isLoading: isProductsLoading } = useLandingPageData()
  const { parentCategories, categoryTree, isLoading: isCategoriesLoading } = useCategoryCatalog()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [slug, subSlug])

  const apiParent = useMemo(
    () => findCategoryBySlug(categoryTree, slug) ?? resolveCategoryBySlug(parentCategories, slug),
    [categoryTree, parentCategories, slug],
  )

  const staticParent = useMemo(
    () => topCategories.find((category) => category.href === `/categories/${slug}`) ?? null,
    [slug],
  )

  const label = apiParent?.name ?? staticParent?.label ?? slug?.replace(/-/g, ' ') ?? 'Category'

  const rawSubcategories = useMemo(() => {
    const apiChildren = getSubcategoriesForParent(categoryTree, slug)
    if (apiChildren.length) return apiChildren
    return getStaticSubcategoriesForSlug(slug)
  }, [categoryTree, slug])

  const subcategories = useMemo(
    () => rawSubcategories.map((subcategory, index) =>
      mapSubcategoryForDisplay(subcategory, slug),
    ),
    [rawSubcategories, slug],
  )

  const activeSubcategory = useMemo(
    () => subcategories.find((subcategory) => subcategory.slug === subSlug) ?? null,
    [subcategories, subSlug],
  )

  const allApiProducts = useMemo(() => {
    if (!landingData) return []

    const sections = ['recommended_products', 'best_sellers', 'flash_sales', 'random_products']
    const seen = new Set()
    const all = []

    for (const key of sections) {
      const normalized = normalizeLandingProducts(landingData[key], {
        prefix: key,
        isHot: key === 'flash_sales',
      })

      for (const product of normalized) {
        if (!seen.has(product.id)) {
          seen.add(product.id)
          all.push(product)
        }
      }
    }

    return all
  }, [landingData])

  const categoryProducts = useMemo(() => {
    if (!allApiProducts.length) return []

    const scored = allApiProducts
      .map((product) => ({ product, score: matchScore(product, slug, label, subSlug) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)

    return scored.length > 0 ? scored.map(({ product }) => product) : allApiProducts
  }, [allApiProducts, slug, label, subSlug])

  const filterCategoryContext = useMemo(
    () => ({ categoryLabel: label, subcategoryLabel: activeSubcategory?.label ?? '' }),
    [label, activeSubcategory],
  )

  const {
    filters,
    draftFilters,
    setDraftFilters,
    drawerOpen,
    activeSection,
    filterGroups,
    filteredProducts,
    draftResultCount,
    activeFilterCount,
    draftFilterCount,
    closeDrawer,
    togglePanel,
    applyPanel,
    applyDraftFilters,
    resetFilters,
    activePanelId,
  } = useCategoryProductFilters(
    categoryProducts,
    subcategories,
    `${slug}:${subSlug ?? 'all'}`,
    filterCategoryContext,
  )

  const isLoading = isProductsLoading || isCategoriesLoading
  const isEmpty = !isLoading && filteredProducts.length === 0
  const showingFallbackProducts = categoryProducts === allApiProducts && allApiProducts.length > 0

  return (
    <SiteLayout>
      <div className="bg-white">
        {!isSubcategoryView && (subcategories.length > 0 || isCategoriesLoading) && (
          <section
            aria-label="Browse subcategories"
            className="border-b border-slate-100 bg-white py-2.5 sm:py-3"
          >
            <CategoryPageContainer>
              <SubcategoryExplorer
                parentSlug={slug}
                subcategories={subcategories}
                activeSubSlug={subSlug}
                isLoading={isCategoriesLoading}
              />
            </CategoryPageContainer>
          </section>
        )}

        <div className={`sticky ${STICKY_OFFSET} z-20 border-b border-slate-100 bg-white`}>
          {isSubcategoryView && (
            <CategoryPageContainer className="pt-2.5 pb-1 sm:pt-3">
              <CategoryBreadcrumb
                parentLabel={label}
                parentSlug={slug}
                subcategoryLabel={activeSubcategory?.label ?? formatSlugLabel(subSlug)}
              />
            </CategoryPageContainer>
          )}

          <CategoryFilterBar
            filters={filters}
            draftFilters={draftFilters}
            setDraftFilters={setDraftFilters}
            filterGroups={filterGroups}
            activeFilterCount={activeFilterCount}
            activePanelId={activePanelId}
            onTogglePanel={togglePanel}
            onApplyPanel={applyPanel}
            draftResultCount={draftResultCount}
            hideSubcategoryChip={isSubcategoryView}
            showTopBorder={isSubcategoryView}
          />
        </div>
      </div>

      <section className="bg-white py-3 sm:py-4">
        <CategoryPageContainer>
          {!isLoading && showingFallbackProducts && activeFilterCount === 0 && (
            <p className="mb-2 text-center text-xs text-slate-500">
              {isSubcategoryView
                ? `No exact matches in ${activeSubcategory?.label ?? 'this subcategory'} yet — showing related products.`
                : 'No exact matches in this category yet — showing related products.'}
            </p>
          )}

          {!isLoading && activeFilterCount > 0 && (
            <p className="mb-2 text-center text-xs text-slate-500">
              Showing {filteredProducts.length} of {categoryProducts.length} products with your filters applied.
            </p>
          )}

          {isLoading ? (
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="aspect-[3/4] animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
          ) : isEmpty ? (
            <CategoryEmptyState
              variant={activeFilterCount > 0 ? 'no-filter-results' : 'no-products'}
              activeFilterCount={activeFilterCount}
              totalProducts={categoryProducts.length}
              onResetFilters={activeFilterCount > 0 ? resetFilters : undefined}
              backHref={activeFilterCount > 0 ? undefined : (isSubcategoryView ? `/categories/${slug}` : '/')}
              backLabel={activeFilterCount > 0 ? undefined : (isSubcategoryView ? `Back to ${label}` : 'Back to Home')}
              description={
                activeFilterCount > 0
                  ? undefined
                  : isSubcategoryView
                    ? `We haven't listed any products in ${activeSubcategory?.label ?? 'this subcategory'} yet.`
                    : `We haven't listed any products in ${label} yet.`
              }
            />
          ) : (
            <motion.div
              key={`${slug}-${subSlug ?? 'all'}-${activeFilterCount}`}
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.035 } },
              }}
              className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            >
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.32, ease } },
                  }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </CategoryPageContainer>
      </section>

      <CategoryFilterDrawer
        open={drawerOpen}
        activeSection={activeSection}
        draftFilters={draftFilters}
        setDraftFilters={setDraftFilters}
        filterGroups={filterGroups}
        subcategories={subcategories}
        resultCount={draftResultCount}
        draftFilterCount={draftFilterCount}
        onClose={closeDrawer}
        onApply={applyDraftFilters}
      />
    </SiteLayout>
  )
}
