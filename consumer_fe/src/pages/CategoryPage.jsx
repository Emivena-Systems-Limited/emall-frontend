import { useMemo } from 'react'
import { useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import SiteLayout from '../components/layout/SiteLayout'
import Container from '../components/layout/Container'
import CategoryHeroBanner from '../components/category/CategoryHeroBanner'
import CategoryQuickFilterTabs from '../components/category/CategoryQuickFilterTabs'
import CategoryBreadcrumb from '../components/category/CategoryBreadcrumb'
import CategoryFilterSidebar from '../components/category/CategoryFilterSidebar'
import CategoryProductsEmptyState from '../components/category/CategoryProductsEmptyState'
import { getParentCategories } from '../services/categoryService'
import { findCategoryBySlug } from '../utils/normalizeCategories'

function formatSlugFallback(slug = '') {
  const parts = slug.split('-')
  const label = parts.length > 1 ? parts.slice(1).join(' ') : parts.join(' ')
  return label ? label.charAt(0).toUpperCase() + label.slice(1) : ''
}

export default function CategoryPage() {
  const { slug, subSlug } = useParams()

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

  const categoryLabel = currentCategory?.name ?? formatSlugFallback(slug)
  const subcategoryLabel = subSlug ? currentSubcategory?.name ?? formatSlugFallback(subSlug) : null
  const subcategories = currentCategory?.children?.filter((child) => child.isActive) ?? []

  return (
    <SiteLayout>
      <div className="bg-white pt-4 sm:pt-5 lg:pt-6">
        <Container>
          <CategoryHeroBanner />
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
              categoryHref={`/categories/${slug}`}
              subcategoryLabel={subcategoryLabel}
            />
          </div>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-6 xl:gap-8">
            <CategoryFilterSidebar
              parentCategories={parentCategories}
              subcategories={subcategories}
              currentSlug={slug}
              currentSubSlug={subSlug}
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
