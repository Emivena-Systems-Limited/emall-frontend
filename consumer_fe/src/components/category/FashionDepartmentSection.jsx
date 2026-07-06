import SubcategoryCarousel from './SubcategoryCarousel'
import CategoryPromoBento from './CategoryPromoBento'

export default function FashionDepartmentSection({ department, subcategories = [], promo }) {
  if (!subcategories.length && !promo) return null

  return (
    <div>
      <SubcategoryCarousel
        title={department?.title ?? 'Fashion'}
        subcategories={subcategories}
        viewAllHref={department?.viewAllHref ?? '/categories/fashion'}
        viewAllLabel={department?.viewAllLabel}
      />
      {promo ? <CategoryPromoBento featured={promo.featured} tiles={promo.tiles} /> : null}
    </div>
  )
}
