import SubcategoryCarousel from './SubcategoryCarousel'

export default function CarouselDepartmentSection({ department, subcategories = [] }) {
  if (!subcategories.length) return null

  return (
    <SubcategoryCarousel
      title={department.title}
      subcategories={subcategories}
      viewAllHref={department.viewAllHref ?? `/categories/${department.parentSlug}`}
      viewAllLabel={department.viewAllLabel}
    />
  )
}
