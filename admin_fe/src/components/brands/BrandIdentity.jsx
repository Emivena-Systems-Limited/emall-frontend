import { getBrandAvatarTone, getBrandInitials } from '../../utils/normalizeAdminBrands'

export function BrandRosterSkeleton({ rows = 6 }) {
  return (
    <section
      className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]"
      aria-busy="true"
      aria-label="Loading brands"
    >
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex items-center gap-4 px-5 py-4">
            <div className="skeleton-shimmer size-10 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="skeleton-shimmer h-3.5 w-40 rounded-md" />
              <div className="skeleton-shimmer h-3 w-24 rounded-md" />
            </div>
            <div className="skeleton-shimmer hidden h-6 w-20 rounded-full sm:block" />
          </div>
        ))}
      </div>
    </section>
  )
}

export default function BrandIdentity({ brand, size = 'md' }) {
  const frame = size === 'lg' ? 'size-16 text-lg' : size === 'sm' ? 'size-8 text-[10px]' : 'size-10 text-xs'
  const rounded = size === 'lg' ? 'rounded-2xl' : 'rounded-xl'

  if (brand?.logo) {
    return (
      <div className="flex min-w-0 items-center gap-3">
        <img
          src={brand.logo}
          alt=""
          className={`${frame} ${rounded} shrink-0 object-cover ring-1 ring-slate-200`}
        />
        <div className="min-w-0">
          <p className={`truncate ${size === 'lg' ? 'text-xl font-bold text-slate-950' : 'font-semibold text-slate-900'}`}>
            {brand.name}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className={`flex ${frame} ${rounded} shrink-0 items-center justify-center font-bold ring-1 ${getBrandAvatarTone(brand?.id)}`}>
        {getBrandInitials(brand?.name)}
      </span>
      <div className="min-w-0">
        <p className={`truncate ${size === 'lg' ? 'text-xl font-bold text-slate-950' : 'font-semibold text-slate-900'}`}>
          {brand?.name}
        </p>
      </div>
    </div>
  )
}
