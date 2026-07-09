import { useEffect } from 'react'
import SiteLayout from '../components/layout/SiteLayout'
import CategoriesPageHeader from '../components/categories/CategoriesPageHeader'
import CategoryPromoBentoSection from '../components/categories/CategoryPromoBentoSection'
import RemainingCategoryDepartmentsSection from '../components/categories/RemainingCategoryDepartmentsSection'
export default function CategoriesPage() {

  useEffect(()=>{
    window.scrollTo(0,0)
  },[])
  return (
    <SiteLayout>
      <CategoriesPageHeader />
      <RemainingCategoryDepartmentsSection
        skip={0}
        limit={2}
        skeletonCount={2}
        deprioritizeSlugs={['fashion']}
      />
      <CategoryPromoBentoSection deprioritizeSlugs={['fashion']} />
      <RemainingCategoryDepartmentsSection skip={2} deprioritizeSlugs={['fashion']} />
    </SiteLayout>
  )
}
