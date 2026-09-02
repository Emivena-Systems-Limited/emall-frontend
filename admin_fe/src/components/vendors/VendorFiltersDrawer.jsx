import { useMemo, useState } from 'react'
import { BadgeCheck, CalendarRange, MapPin, RotateCcw, Shield, SlidersHorizontal, Wallet } from 'lucide-react'
import {
  GHANA_REGIONS,
  JOINED_PRESETS,
  SALES_BANDS,
  VENDOR_KYC,
  VENDOR_STATUSES,
} from '../../constants/vendorsData'
import { countVendorDrawerFilters, toggleFilterValue } from '../../utils/vendorFilters'
import SlideDrawer from './SlideDrawer'

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

function ToggleChip({ active, label, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`cursor-pointer rounded-full px-3.5 py-2 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
        active
          ? 'bg-slate-900 text-white shadow-sm'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
      }`}
    >
      {label}
    </button>
  )
}

export default function VendorFiltersDrawer({
  open,
  onClose,
  filters,
  onChange,
  onClear,
  resultCount,
}) {
  const [regionQuery, setRegionQuery] = useState('')
  const activeCount = useMemo(() => countVendorDrawerFilters(filters), [filters])

  const visibleRegions = GHANA_REGIONS.filter((region) =>
    region.toLowerCase().includes(regionQuery.trim().toLowerCase()),
  )

  return (
    <SlideDrawer
      open={open}
      onClose={onClose}
      labelledBy="vendor-filters-title"
      title="Filter vendors"
      subtitle={
        activeCount > 0
          ? `${activeCount} filter${activeCount === 1 ? '' : 's'} applied`
          : 'Narrow the roster without leaving this page'
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
            Show {resultCount} vendor{resultCount === 1 ? '' : 's'}
          </button>
        </>
      )}
    >
      <div className="space-y-4">
        <FilterCard icon={Shield} title="Store status" description="Active, pending, rejected, or suspended">
          <div className="flex flex-wrap gap-2">
            {VENDOR_STATUSES.map((status) => (
              <ToggleChip
                key={status.key}
                active={filters.statuses.includes(status.key)}
                label={status.label}
                onClick={() => onChange({ statuses: toggleFilterValue(filters.statuses, status.key) })}
              />
            ))}
          </div>
        </FilterCard>

        <FilterCard icon={BadgeCheck} title="KYC" description="Identity and document checks">
          <div className="flex flex-wrap gap-2">
            {VENDOR_KYC.map((item) => (
              <ToggleChip
                key={item.key}
                active={filters.kyc.includes(item.key)}
                label={item.label}
                onClick={() => onChange({ kyc: toggleFilterValue(filters.kyc, item.key) })}
              />
            ))}
          </div>
        </FilterCard>

        <FilterCard icon={MapPin} title="Region" description="All 16 Ghana regions">
          <input
            type="search"
            value={regionQuery}
            onChange={(event) => setRegionQuery(event.target.value)}
            placeholder="Find a region"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand-light"
          />
          <div className="flex flex-wrap gap-2">
            {visibleRegions.map((region) => (
              <ToggleChip
                key={region}
                active={filters.regions.includes(region)}
                label={region}
                onClick={() => onChange({ regions: toggleFilterValue(filters.regions, region) })}
              />
            ))}
            {visibleRegions.length === 0 && (
              <p className="text-xs text-slate-500">No region matches that search.</p>
            )}
          </div>
          {filters.regions.length > 0 && (
            <button
              type="button"
              onClick={() => onChange({ regions: [] })}
              className="cursor-pointer text-xs font-semibold text-slate-500 hover:text-brand"
            >
              Clear regions
            </button>
          )}
        </FilterCard>

        <FilterCard icon={CalendarRange} title="Joined" description="When the store first landed on EZ-Mall">
          <div className="flex flex-wrap gap-2">
            {JOINED_PRESETS.map((preset) => (
              <ToggleChip
                key={preset.key}
                active={filters.joined === preset.key}
                label={preset.label}
                onClick={() => onChange({ joined: preset.key })}
              />
            ))}
          </div>
        </FilterCard>

        <FilterCard icon={Wallet} title="Sales (30d)" description="Paid order value in the last 30 days">
          <div className="flex flex-wrap gap-2">
            {SALES_BANDS.map((band) => (
              <ToggleChip
                key={band.key}
                active={filters.salesBand === band.key}
                label={band.label}
                onClick={() => onChange({ salesBand: band.key })}
              />
            ))}
          </div>
        </FilterCard>
      </div>
    </SlideDrawer>
  )
}
