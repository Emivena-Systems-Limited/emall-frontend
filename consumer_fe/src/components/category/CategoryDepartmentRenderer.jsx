import { Link } from 'react-router'
import { CATEGORY_LAYOUT_TYPES } from '../../constants/categoryPageLayouts'
import { FASHION_PROMO_SECTION } from '../../constants/categoryDepartmentSections'
import CategoryDepartmentSection from './CategoryDepartmentSection'
import CarouselDepartmentSection from './CarouselDepartmentSection'
import FashionDepartmentSection from './FashionDepartmentSection'
import PhonesTabletsDepartmentSection from './PhonesTabletsDepartmentSection'
import MosaicDepartmentSection from './MosaicDepartmentSection'
import StackedDepartmentSection from './StackedDepartmentSection'
import CompactDepartmentSection from './CompactDepartmentSection'
import CategorySectionHeader from './CategorySectionHeader'

function EmptyDepartmentFallback({ department }) {
  return (
    <section aria-labelledby={`department-${department.parentSlug}`}>
      <CategorySectionHeader
        title={department.title}
        viewAllHref={department.viewAllHref}
        accent={department.accent}
      />
      <Link
        to={department.viewAllHref}
        className="mt-3 flex min-h-28 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80 text-sm font-semibold text-slate-600 transition-colors hover:border-auth-primary/30 hover:text-auth-primary"
      >
        Explore {department.title}
      </Link>
    </section>
  )
}

export default function CategoryDepartmentRenderer({ department, index = 0 }) {
  if (!department) return null

  const { layout, subcategories } = department

  if (!subcategories.length) {
    return <EmptyDepartmentFallback department={department} />
  }

  const shellClass = index % 2 === 1 ? 'rounded-2xl bg-slate-50/50 p-3 sm:p-4' : ''

  const content = (() => {
    switch (layout) {
      case CATEGORY_LAYOUT_TYPES.BENTO:
        return (
          <FashionDepartmentSection
            department={department}
            subcategories={subcategories}
            promo={department.parentSlug === 'fashion' ? FASHION_PROMO_SECTION : null}
          />
        )
      case CATEGORY_LAYOUT_TYPES.CAROUSEL:
        return (
          <CarouselDepartmentSection
            department={department}
            subcategories={subcategories}
          />
        )
      case CATEGORY_LAYOUT_TYPES.PHONES_TABLETS:
        return (
          <PhonesTabletsDepartmentSection
            department={department}
            subcategories={subcategories}
          />
        )
      case CATEGORY_LAYOUT_TYPES.MOSAIC:
        return (
          <MosaicDepartmentSection
            department={department}
            subcategories={subcategories}
          />
        )
      case CATEGORY_LAYOUT_TYPES.STACKED:
        return (
          <StackedDepartmentSection
            department={department}
            subcategories={subcategories}
          />
        )
      case CATEGORY_LAYOUT_TYPES.COMPACT:
        return (
          <CompactDepartmentSection
            department={department}
            subcategories={subcategories}
          />
        )
      case CATEGORY_LAYOUT_TYPES.GRID:
      default:
        return (
          <CategoryDepartmentSection
            department={department}
            subcategories={subcategories}
          />
        )
    }
  })()

  if (!shellClass) return content

  return <div className={shellClass}>{content}</div>
}
