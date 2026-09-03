import { Percent, RotateCcw, SlidersHorizontal, Store } from 'lucide-react'
import { COUPON_TYPE_FILTERS } from '../../constants/coupons'
import { formatCount } from '../../utils/formatters'
import { countCouponDrawerFilters } from '../../utils/couponFilters'
import SlideDrawer from '../vendors/SlideDrawer'
import CouponVendorPicker from './CouponVendorPicker'

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

export default function CouponFiltersDrawer({
  open,
  onClose,
  type,
  vendorId,
  vendorName,
  onTypeChange,
  onVendorChange,
  onClear,
  resultCount = 0,
}) {
  const activeCount = countCouponDrawerFilters({ type, vendorId })

  return (
    <SlideDrawer
      open={open}
      onClose={onClose}
      labelledBy="coupon-filters-title"
      title="Filter coupons"
      subtitle={
        activeCount > 0
          ? `${activeCount} filter${activeCount === 1 ? '' : 's'} applied`
          : 'Narrow codes by offer type or store'
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
            Show {formatCount(resultCount)} coupon{resultCount === 1 ? '' : 's'}
          </button>
        </>
      )}
    >
      <div className="space-y-4">
        <FilterCard icon={Percent} title="Offer" description="How the discount is calculated">
          <label htmlFor="coupon-type" className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Discount type
            </span>
            <select
              id="coupon-type"
              value={type}
              onChange={(event) => onTypeChange(event.target.value)}
              className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand-light"
            >
              {COUPON_TYPE_FILTERS.map((option) => (
                <option key={option.key || 'any'} value={option.key}>{option.label}</option>
              ))}
            </select>
          </label>
        </FilterCard>

        <FilterCard icon={Store} title="Store" description="Codes created for a specific vendor">
          <CouponVendorPicker
            id="coupon-filter-vendor"
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
