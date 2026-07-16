import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { SlidersHorizontal } from 'lucide-react'
import SiteLayout from '../components/layout/SiteLayout'
import Container from '../components/layout/Container'
import PromotionsHeroBanner from '../components/promotions/PromotionsHeroBanner'
import CategoryQuickFilterTabs from '../components/category/CategoryQuickFilterTabs'
import PromotionsBreadcrumb from '../components/promotions/PromotionsBreadcrumb'
import CategoryFilterSidebar from '../components/category/CategoryFilterSidebar'
import CategoryFilterDrawer from '../components/category/CategoryFilterDrawer'
import PromotionsProductsEmptyState from '../components/promotions/PromotionsProductsEmptyState'
import { getParentCategories } from '../services/categoryService'
import {
  findCategoryBySlug,
  formatCategorySlugLabel,
} from '../utils/normalizeCategories'
import {
  FILTER_CATEGORY_PARAM,
  FILTER_SUBCATEGORY_PARAM,
  formatMultiFilterLabel,
  getSelectedFilterValues,
} from '../utils/listingFilterParams'

export default function PromotionsPage() {
  const [searchParams] = useSearchParams()
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const { data: parentCategories = [], isLoading } = useQuery({
    queryKey: ['parent-categories'],
    queryFn: getParentCategories,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  const hasCategoryParams = searchParams.getAll(FILTER_CATEGORY_PARAM).length > 0
  const allCategoriesActive = !hasCategoryParams

  const selectedCategorySlugs = useMemo(
    () => (
      allCategoriesActive
        ? []
        : getSelectedFilterValues(searchParams, FILTER_CATEGORY_PARAM)
    ),
    [allCategoriesActive, searchParams],
  )

  const selectedSubcategorySlugs = useMemo(
    () => getSelectedFilterValues(searchParams, FILTER_SUBCATEGORY_PARAM),
    [searchParams],
  )

  const selectedCategoryLabels = selectedCategorySlugs.map(
    (slug) => findCategoryBySlug(parentCategories, slug)?.name ?? formatCategorySlugLabel(slug),
  )
  const selectedSubcategoryLabels = selectedSubcategorySlugs.map(
    (slug) => findCategoryBySlug(parentCategories, slug)?.name ?? formatCategorySlugLabel(slug),
  )

  const categoryLabel = allCategoriesActive
    ? null
    : formatMultiFilterLabel(selectedCategoryLabels, null)

  const subcategoryLabel = selectedSubcategoryLabels.length
    ? formatMultiFilterLabel(selectedSubcategoryLabels, null)
    : null

  const emptyStateLabel = formatMultiFilterLabel(
    selectedSubcategoryLabels.length ? selectedSubcategoryLabels : selectedCategoryLabels,
    'all categories',
  )

  const categoryHref = selectedCategorySlugs.length === 1
    ? `/promotions?category=${selectedCategorySlugs[0]}`
    : '/promotions'

  return (
    <SiteLayout>
      <div className="bg-white pt-4 sm:pt-5 lg:pt-6">
        <Container>
          <PromotionsHeroBanner isLoading={isLoading} />
        </Container>
      </div>

      <div className="border-y border-slate-200 bg-white py-3 sm:py-3.5">
        <Container>
          <CategoryQuickFilterTabs />
        </Container>
      </div>

      <section className="bg-slate-50 py-4 sm:py-5 lg:py-6">
        <Container>
          <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5">
            <PromotionsBreadcrumb
              categoryLabel={categoryLabel}
              categoryHref={categoryHref}
              subcategoryLabel={subcategoryLabel}
            />

            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(true)}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm shadow-slate-200/60 transition-colors hover:border-auth-primary hover:text-auth-primary sm:text-sm lg:hidden"
            >
              <SlidersHorizontal className="size-3.5 sm:size-4" strokeWidth={2.25} aria-hidden />
              Filters
            </button>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-6 xl:gap-8">
            <CategoryFilterSidebar
              parentCategories={parentCategories}
              isLoading={isLoading}
              variant="promotions"
            />

            <div className="flex min-w-0 flex-1 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm shadow-slate-200/60 sm:p-4">
              <PromotionsProductsEmptyState categoryLabel={emptyStateLabel} />
            </div>
          </div>
        </Container>
      </section>

      <CategoryFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        parentCategories={parentCategories}
        isLoading={isLoading}
        variant="promotions"
      />
    </SiteLayout>
  )
}
