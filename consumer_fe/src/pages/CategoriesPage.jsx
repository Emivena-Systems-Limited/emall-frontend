import SiteLayout from '../components/layout/SiteLayout'
import CategoriesPageHeader from '../components/categories/CategoriesPageHeader'
import { ElectronicsDepartmentSection, FashionDepartmentSection } from '../components/categories/CategoryDepartmentSection'
import FashionPromoBentoSection from '../components/categories/FashionPromoBentoSection'
import RemainingCategoryDepartmentsSection from '../components/categories/RemainingCategoryDepartmentsSection'

export default function CategoriesPage() {
  return (
    <SiteLayout>
      <CategoriesPageHeader />
      <ElectronicsDepartmentSection />
      <FashionDepartmentSection />
      <FashionPromoBentoSection />
      <RemainingCategoryDepartmentsSection />
    </SiteLayout>
  )
}
