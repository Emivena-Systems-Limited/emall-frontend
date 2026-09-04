import { useEffect, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import SiteLayout from '../components/layout/SiteLayout'
import Container from '../components/layout/Container'
import CategoriesPageHeader from '../components/categories/CategoriesPageHeader'
import CategoriesPageSkeleton from '../components/categories/CategoriesPageSkeleton'
import CategoryPromoBentoSection from '../components/categories/CategoryPromoBentoSection'
import RemainingCategoryDepartmentsSection from '../components/categories/RemainingCategoryDepartmentsSection'
import { useCategoryCatalog } from '../hooks/useCategoryCatalog'
import { buildCategoriesPageCatalog } from '../utils/buildCategoriesPageCatalog'

const pageEase = [0.16, 1, 0.3, 1]

export default function CategoriesPage() {
  const { parentCategories, isLoading, isError } = useCategoryCatalog()

  const catalog = useMemo(
    () => buildCategoriesPageCatalog(parentCategories),
    [parentCategories],
  )

  const showSkeleton = isLoading
  const showEmpty = !isLoading && isError && parentCategories.length === 0

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <SiteLayout>
      <CategoriesPageHeader />
      <AnimatePresence mode="wait">
        {showSkeleton ? (
          <motion.div
            key="categories-skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CategoriesPageSkeleton includeHeader={false} />
          </motion.div>
        ) : showEmpty ? (
          <motion.section
            key="categories-empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32, ease: pageEase }}
            className="bg-white pb-16 pt-2 sm:pb-20"
          >
            <Container>
              <p className="text-sm leading-relaxed text-slate-500 sm:text-base">
                Categories are unavailable right now. Please try again shortly.
              </p>
            </Container>
          </motion.section>
        ) : (
          <motion.div
            key="categories-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32, ease: pageEase }}
          >
            <RemainingCategoryDepartmentsSection
              departments={catalog.leadingDepartments}
              skeletonCount={2}
            />
            <CategoryPromoBentoSection content={catalog.bento} />
            <RemainingCategoryDepartmentsSection
              departments={catalog.remainingDepartments}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </SiteLayout>
  )
}
