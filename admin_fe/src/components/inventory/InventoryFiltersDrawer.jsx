import { RotateCcw, SlidersHorizontal, Store } from 'lucide-react'
import { formatCount } from '../../utils/formatters'
import { countInventoryDrawerFilters } from '../../utils/inventoryFilters'
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

export default function InventoryFiltersDrawer({
  open,
  onClose,
  vendorId,
  vendorName,
  onVendorChange,
  onClear,
  resultCount = 0,
}) {
  const activeCount = countInventoryDrawerFilters({ vendorId })

  return (
    <SlideDrawer
      open={open}
      onClose={onClose}
      labelledBy="inventory-filters-title"
      title="Filter inventory"
      subtitle={
        activeCount > 0
          ? `${activeCount} filter${activeCount === 1 ? '' : 's'} applied`
          : 'Narrow stock records by store'
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
            Show {formatCount(resultCount)} record{resultCount === 1 ? '' : 's'}
          </button>
        </>
      )}
    >
      <div className="space-y-4">
        <FilterCard icon={Store} title="Store" description="Stock held by a specific vendor">
          <CouponVendorPicker
            id="inventory-filter-vendor"
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
