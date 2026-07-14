import { useEffect, useMemo } from 'react'
import { Navigate, useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import SiteLayout from '../components/layout/SiteLayout'
import Container from '../components/layout/Container'
import CategoryHeroBanner from '../components/category/CategoryHeroBanner'
import CategoryQuickFilterTabs from '../components/category/CategoryQuickFilterTabs'
import CategoryBreadcrumb from '../components/category/CategoryBreadcrumb'
import CategoryFilterSidebar from '../components/category/CategoryFilterSidebar'
import CategoryProductsEmptyState from '../components/category/CategoryProductsEmptyState'
import { getParentCategories } from '../services/categoryService'
import {
  findCategoryBySlug,
  formatCategorySlugLabel,
} from '../utils/normalizeCategories'

export default function CategoryPage() {
  const { slug, subSlug } = useParams()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug, subSlug])

  const { data: parentCategories = [], isLoading } = useQuery({
    queryKey: ['parent-categories'],
    queryFn: getParentCategories,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  const currentCategory = useMemo(
    () => findCategoryBySlug(parentCategories, slug),
    [parentCategories, slug],
  )

  const currentSubcategory = useMemo(
    () => (subSlug ? findCategoryBySlug(parentCategories, subSlug) : null),
    [parentCategories, subSlug],
  )

  const canonicalSlug = currentCategory?.slug ?? slug
  const canonicalSubSlug = currentSubcategory?.slug ?? subSlug
  const shouldRedirect = !isLoading && currentCategory && (
    slug !== canonicalSlug
    || (subSlug && currentSubcategory && subSlug !== canonicalSubSlug)
  )

  if (shouldRedirect) {
    const redirectPath = canonicalSubSlug
      ? `/categories/${canonicalSlug}/${canonicalSubSlug}`
      : `/categories/${canonicalSlug}`

    return <Navigate to={redirectPath} replace />
  }

  const categoryLabel = currentCategory?.name ?? formatCategorySlugLabel(slug)
  const subcategoryLabel = subSlug ? currentSubcategory?.name ?? formatCategorySlugLabel(subSlug) : null
  const subcategories = currentCategory?.children?.filter((child) => child.isActive) ?? []

  return (
    <SiteLayout>
      <div className="bg-white pt-4 sm:pt-5 lg:pt-6">
        <Container>
          <CategoryHeroBanner
            category={currentCategory}
            subcategory={currentSubcategory}
            subcategories={subcategories}
            categoryLabel={categoryLabel}
            isLoading={isLoading}
          />
        </Container>
      </div>

      <div className="border-y border-slate-200 bg-white py-3 sm:py-3.5">
        <Container>
          <CategoryQuickFilterTabs />
        </Container>
      </div>

      <section className="bg-slate-50 py-4 sm:py-5 lg:py-6">
        <Container>
          <div className="mb-4 sm:mb-5">
            <CategoryBreadcrumb
              categoryLabel={categoryLabel}
              categoryHref={`/categories/${canonicalSlug}`}
              subcategoryLabel={subcategoryLabel}
            />
          </div>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-6 xl:gap-8">
            <CategoryFilterSidebar
              parentCategories={parentCategories}
              subcategories={subcategories}
              currentSlug={canonicalSlug}
              currentSubSlug={canonicalSubSlug}
              isLoading={isLoading}
            />

            <div className="flex min-w-0 flex-1 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm shadow-slate-200/60 sm:p-4">
              <CategoryProductsEmptyState categoryLabel={subcategoryLabel ?? categoryLabel} />
            </div>
          </div>
        </Container>
      </section>
    </SiteLayout>
  )
}
