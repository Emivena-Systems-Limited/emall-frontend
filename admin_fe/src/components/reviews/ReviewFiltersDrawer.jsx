import { RotateCcw, SlidersHorizontal, Star, Store } from 'lucide-react'
import { REVIEW_FEATURED_FILTERS, REVIEW_RATING_FILTERS } from '../../constants/reviews'
import { formatCount } from '../../utils/formatters'
import { countReviewDrawerFilters } from '../../utils/reviewFilters'
import SlideDrawer from '../vendors/SlideDrawer'
import CouponVendorPicker from '../coupons/CouponVendorPicker'

function FilterCard({ icon: Icon, title, description, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
            <Icon className="size-4" strokeWidth={2} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            <p className="mt-0.5 text-xs text-slate-500">{description}</p>
          </div>
        </div>
      </div>
      <div className="space-y-3 p-4">{children}</div>
    </section>
  )
}

export default function ReviewFiltersDrawer({
  open,
  onClose,
  rating,
  featured,
  vendorId,
  vendorName,
  onRatingChange,
  onFeaturedChange,
  onVendorChange,
  onClear,
  resultCount = 0,
}) {
  const activeCount = countReviewDrawerFilters({ rating, featured, vendorId })

  return (
    <SlideDrawer
      open={open}
      onClose={onClose}
      labelledBy="review-filters-title"
      title="Filter reviews"
      subtitle={
        activeCount > 0
          ? `${activeCount} filter${activeCount === 1 ? '' : 's'} applied`
          : 'Narrow reviews by rating, featured, or store'
      }
      icon={SlidersHorizontal}
      footer={(
        <>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              <RotateCcw className="size-4" />
              Clear filters
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-full cursor-pointer rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            Show {formatCount(resultCount)} review{resultCount === 1 ? '' : 's'}
          </button>
        </>
      )}
    >
      <div className="space-y-4">
        <FilterCard icon={Star} title="Rating" description="How many stars the shopper gave">
          <label htmlFor="review-rating" className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Stars
            </span>
            <select
              id="review-rating"
              value={rating}
              onChange={(event) => onRatingChange(event.target.value)}
              className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand-light"
            >
              {REVIEW_RATING_FILTERS.map((option) => (
                <option key={option.key || 'any'} value={option.key}>{option.label}</option>
              ))}
            </select>
          </label>

          <label htmlFor="review-featured" className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Featured
            </span>
            <select
              id="review-featured"
              value={featured}
              onChange={(event) => onFeaturedChange(event.target.value)}
              className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand-light"
            >
              {REVIEW_FEATURED_FILTERS.map((option) => (
                <option key={option.key || 'any'} value={option.key}>{option.label}</option>
              ))}
            </select>
          </label>
        </FilterCard>

        <FilterCard icon={Store} title="Store" description="Reviews left on a specific vendor">
          <CouponVendorPicker
            id="review-filter-vendor"
            valueId={vendorId}
            valueName={vendorName}
            onChange={onVendorChange}
            placeholder="Search store name"
          />
        </FilterCard>
      </div>
    </SlideDrawer>
  )
}
