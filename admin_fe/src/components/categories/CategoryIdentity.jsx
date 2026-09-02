import CategoryImage from './CategoryImage'
import { getCategoryDisplayImage } from '../../utils/normalizeAdminCategories'

export function CategoryRosterSkeleton({ rows = 8 }) {
  return (
    <section
      className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]"
      aria-busy="true"
      aria-label="Loading categories"
    >
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex items-center gap-4 px-5 py-3.5">
            <div className="skeleton-shimmer size-9 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="skeleton-shimmer h-3.5 w-40 rounded-md" />
              <div className="skeleton-shimmer h-3 w-24 rounded-md" />
            </div>
            <div className="skeleton-shimmer hidden h-6 w-16 rounded-full sm:block" />
          </div>
        ))}
      </div>
    </section>
  )
}

export function CategoryIdentity({ category, compact = false, nested = false }) {
  const src = getCategoryDisplayImage(category, nested)

  return (
    <div className="flex min-w-0 items-center gap-3">
      <CategoryImage
        src={src}
        size={compact ? 'sm' : 'md'}
        className={nested ? 'ring-brand-muted' : ''}
      />
      <div className="min-w-0">
        {nested ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand/70">Subcategory</p>
        ) : null}
        <p className={`truncate ${nested ? 'text-sm font-medium text-slate-800' : 'font-semibold text-slate-900'}`}>
          {category.name}
        </p>
      </div>
    </div>
  )
}

export default CategoryIdentity
