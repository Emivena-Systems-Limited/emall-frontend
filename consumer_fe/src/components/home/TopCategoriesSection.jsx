import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import Container from '../layout/Container'
import { topCategories } from '../../constants/topCategories'
import { getParentCategories } from '../../services/categoryService'
import TopCategoryItem from './TopCategoryItem'

function getCategoryImage(category, index) {
  return category.image ?? topCategories[index % topCategories.length]?.image ?? null
}

function mapApiCategory(category, index) {
  return {
    id: category.id ?? category.slug,
    label: category.name,
    href: `/categories/${category.slug}`,
    image: getCategoryImage(category, index),
  }
}

export default function TopCategoriesSection() {
  const { data: apiCategories = [] } = useQuery({
    queryKey: ['parent-categories'],
    queryFn: getParentCategories,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  const categories = useMemo(() => {
    if (!apiCategories.length) return topCategories
    return apiCategories.map(mapApiCategory)
  }, [apiCategories])

  const visibleCategories = categories.slice(0, 10)
  const canViewAll = categories.length > 10

  return (
    <section aria-labelledby="top-categories-heading" className="bg-white py-4 sm:py-5 lg:py-6">
      <Container>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
          <div className="mb-5 flex items-center justify-between gap-4 sm:mb-6">
            <h2
              id="top-categories-heading"
              className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl"
            >
              Top Categories
            </h2>
            {canViewAll && (
              <Link
                to="/categories"
                className="shrink-0 text-sm font-semibold text-auth-primary underline-offset-2 hover:underline sm:text-[0.9375rem]"
              >
                View All
              </Link>
            )}
          </div>

          <div
            className="flex gap-3 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-4 lg:justify-between lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden"
          >
            {visibleCategories.map((category) => (
              <TopCategoryItem key={category.id} category={category} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
