import { Link } from 'react-router'
import { useMemo } from 'react'
import { ArrowLeft } from 'lucide-react'
import SiteLayout from '../components/layout/SiteLayout'
import Container from '../components/layout/Container'
import BrowseCategoriesHero from '../components/category/BrowseCategoriesHero'
import CategoryDepartmentsList from '../components/category/CategoryDepartmentsList'
import { FEATURED_CATEGORY_SPOTLIGHTS } from '../constants/featuredCategorySpotlights'
import { useCategoryCatalog } from '../hooks/useCategoryCatalog'
import { buildAllCategoryDepartments, sortParentCategoriesForDisplay } from '../utils/buildCategoryDepartments'
import { resolveCategoryLayout, getDepartmentAccent, resolveGridColumns } from '../constants/categoryPageLayouts'
import { topCategories } from '../constants/topCategories'

function resolveSpotlights(apiCategories = []) {
  return FEATURED_CATEGORY_SPOTLIGHTS.map((spotlight) => {
    const apiMatch = apiCategories.find((category) => category.slug === spotlight.slug)
    if (!apiMatch) return spotlight

    return {
      ...spotlight,
      href: `/categories/${apiMatch.slug}`,
      title: spotlight.featured ? spotlight.title : (apiMatch.name ?? spotlight.title),
    }
  })
}

function buildFallbackDepartments() {
  const sorted = sortParentCategoriesForDisplay(
    topCategories.map((category) => ({
      id: category.id,
      parentSlug: category.href.replace('/categories/', ''),
      title: category.label,
      viewAllHref: category.href,
      subcategories: [],
    })),
  )

  return sorted.map((department, index) => ({
    ...department,
    layout: resolveCategoryLayout(department.parentSlug, index),
    gridColumns: resolveGridColumns(department.parentSlug),
    accent: getDepartmentAccent(index),
  }))
}

export default function CategoriesPage() {
  const { parentCategories, categoryTree, isLoading } = useCategoryCatalog()

  const spotlights = useMemo(
    () => resolveSpotlights(parentCategories),
    [parentCategories],
  )

  const departments = useMemo(() => {
    if (!parentCategories.length) {
      return isLoading ? [] : buildFallbackDepartments()
    }

    return buildAllCategoryDepartments(parentCategories, categoryTree)
  }, [parentCategories, categoryTree, isLoading])

  const heroSpotlights = spotlights.length ? spotlights : FEATURED_CATEGORY_SPOTLIGHTS
  const departmentsLoading = isLoading && departments.length === 0

  return (
    <SiteLayout>
      <section className="bg-white py-4 sm:py-6">
        <Container>
          <BrowseCategoriesHero
            spotlights={heroSpotlights}
            headerAction={(
              <Link
                to="/"
                className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200/90 bg-linear-to-b from-white to-slate-50/80 p-1.5 text-xs font-semibold text-slate-700 shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition-all hover:border-auth-primary/25 hover:from-white hover:to-auth-primary/5 hover:text-auth-primary hover:shadow-[0_4px_14px_-8px_rgba(199,59,45,0.35)] sm:gap-2.5 sm:py-2 sm:pl-2 sm:pr-4 sm:text-sm"
              >
                <span className="inline-flex size-7 items-center justify-center rounded-full bg-slate-100 text-slate-600 ring-1 ring-slate-200/80 transition-all group-hover:bg-auth-primary group-hover:text-white group-hover:ring-auth-primary/30 sm:size-8">
                  <ArrowLeft className="size-3.5 sm:size-4" strokeWidth={2.25} aria-hidden />
                </span>
                <span className="hidden sm:inline">Back to home</span>
                <span className="sr-only sm:hidden">Back to home</span>
              </Link>
            )}
          />

          <div className="mt-6 sm:mt-8">
            <CategoryDepartmentsList
              departments={departments}
              isLoading={departmentsLoading}
              skeletonCount={Math.max(parentCategories.length, 8)}
            />
          </div>
        </Container>
      </section>
    </SiteLayout>
  )
}
