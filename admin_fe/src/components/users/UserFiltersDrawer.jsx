import { MapPin, Phone, RotateCcw, ShoppingBag, SlidersHorizontal } from 'lucide-react'
import { GHANA_REGIONS } from '../../constants/adminDashboardData'
import { USER_ACTIVITY_FILTERS, USER_PHONE_FILTERS } from '../../constants/adminUsers'
import { formatCount } from '../../utils/formatters'
import { countUserDrawerFilters } from '../../utils/userFilters'
import SlideDrawer from '../vendors/SlideDrawer'

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

function FilterSelect({ id, label, value, onChange, children }) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand-light"
      >
        {children}
      </select>
    </label>
  )
}

export default function UserFiltersDrawer({
  open,
  onClose,
  region,
  district,
  city,
  phoneVerified,
  activity,
  districtOptions = [],
  cityOptions = [],
  onRegionChange,
  onDistrictChange,
  onCityChange,
  onPhoneVerifiedChange,
  onActivityChange,
  onClear,
  resultCount = 0,
}) {
  const activeCount = countUserDrawerFilters({
    region,
    district,
    city,
    phoneVerified,
    activity,
  })

  return (
    <SlideDrawer
      open={open}
      onClose={onClose}
      labelledBy="user-filters-title"
      title="Filter users"
      subtitle={
        activeCount > 0
          ? `${activeCount} filter${activeCount === 1 ? '' : 's'} applied`
          : 'Narrow the roster by location, phone, or order activity'
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
            Show {formatCount(resultCount)} user{resultCount === 1 ? '' : 's'}
          </button>
        </>
      )}
    >
      <div className="space-y-4">
        <FilterCard icon={MapPin} title="Location" description="Region, district, and town on the shopper profile">
          <FilterSelect id="user-region" label="Region" value={region} onChange={onRegionChange}>
            <option value="">Any region</option>
            {GHANA_REGIONS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </FilterSelect>
          <FilterSelect id="user-district" label="District" value={district} onChange={onDistrictChange}>
            <option value="">Any district</option>
            {districtOptions.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </FilterSelect>
          <FilterSelect id="user-city" label="Town" value={city} onChange={onCityChange}>
            <option value="">Any town</option>
            {cityOptions.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </FilterSelect>
        </FilterCard>

        <FilterCard icon={Phone} title="Phone" description="Whether the number on the account is confirmed">
          <FilterSelect
            id="user-phone-verified"
            label="Phone confirmation"
            value={phoneVerified}
            onChange={onPhoneVerifiedChange}
          >
            {USER_PHONE_FILTERS.map((option) => (
              <option key={option.key || 'any'} value={option.key}>{option.label}</option>
            ))}
          </FilterSelect>
        </FilterCard>

        <FilterCard icon={ShoppingBag} title="Orders" description="Whether this shopper has checked out">
          <FilterSelect
            id="user-activity"
            label="Order activity"
            value={activity}
            onChange={onActivityChange}
          >
            {USER_ACTIVITY_FILTERS.map((option) => (
              <option key={option.key || 'any'} value={option.key}>{option.label}</option>
            ))}
          </FilterSelect>
        </FilterCard>
      </div>
    </SlideDrawer>
  )
}
