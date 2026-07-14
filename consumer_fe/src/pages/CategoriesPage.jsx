import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import SiteLayout from '../components/layout/SiteLayout'
import CategoriesPageHeader from '../components/categories/CategoriesPageHeader'
import CategoriesPageSkeleton from '../components/categories/CategoriesPageSkeleton'
import CategoryPromoBentoSection from '../components/categories/CategoryPromoBentoSection'
import RemainingCategoryDepartmentsSection from '../components/categories/RemainingCategoryDepartmentsSection'
import { getParentCategories } from '../services/categoryService'

const pageEase = [0.16, 1, 0.3, 1]

export default function CategoriesPage() {
  const { data: parentCategories = [], isLoading } = useQuery({
    queryKey: ['parent-categories'],
    queryFn: getParentCategories,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  const showSkeleton = isLoading && parentCategories.length === 0

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <SiteLayout>
      <AnimatePresence mode="wait">
        {showSkeleton ? (
          <motion.div
            key="categories-skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CategoriesPageSkeleton />
          </motion.div>
        ) : (
          <motion.div
            key="categories-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32, ease: pageEase }}
          >
            <CategoriesPageHeader />
            <RemainingCategoryDepartmentsSection
              skip={0}
              limit={2}
              skeletonCount={2}
              deprioritizeSlugs={['fashion']}
            />
            <CategoryPromoBentoSection deprioritizeSlugs={['fashion']} />
            <RemainingCategoryDepartmentsSection skip={2} deprioritizeSlugs={['fashion']} />
          </motion.div>
        )}
      </AnimatePresence>
    </SiteLayout>
  )
}
