import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import Container from '../layout/Container'
import { topCategories } from '../../constants/topCategories'
import { getParentCategories } from '../../services/categoryService'
import { mapApiCategory } from '../../utils/categoryDisplay'
import TopCategoriesCarousel from './TopCategoriesCarousel'

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

  return (
    <section aria-labelledby="top-categories-heading" className="bg-[#f2f2f2] py-4 sm:py-5 lg:py-6">
      <Container>
        <TopCategoriesCarousel categories={categories} />
      </Container>
    </section>
  )
}
