import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import Container from '../layout/Container'
import { topCategories } from '../../constants/topCategories'
import { getParentCategories } from '../../services/categoryService'
import { mapApiCategory, sortTopCategories } from '../../utils/categoryDisplay'
import { toCategoryListingHref } from '../../utils/listingFilterParams'
import TopCategoriesCarousel from './TopCategoriesCarousel'

export default function TopCategoriesSection() {
  const { data: parentCategories = [], isPending, isError } = useQuery({
    queryKey: ['parent-categories'],
    queryFn: getParentCategories,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  const categories = useMemo(() => {
    if (parentCategories.length) {
      return sortTopCategories(parentCategories.map((category, index) => mapApiCategory(category, index)))
    }

    if (isPending) return []

    return topCategories.map((category) => ({
      ...category,
      href: toCategoryListingHref(category.href),
    }))
  }, [isPending, parentCategories])

  return (
    <section aria-labelledby="top-categories-heading" className="w-full bg-[#f2f2f2] py-4 sm:py-5 lg:py-6">
      <Container className="w-full">
        <TopCategoriesCarousel
          categories={categories}
          isLoading={isPending}
          isError={isError && parentCategories.length === 0}
        />
      </Container>
    </section>
  )
}
