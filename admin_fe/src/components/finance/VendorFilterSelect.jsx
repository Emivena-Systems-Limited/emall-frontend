import { useMemo } from 'react'
import { useAdminVendors } from '../../hooks/useAdminVendors'
import SearchableOptionSelect from './SearchableOptionSelect'

function toVendorOption(vendor) {
  return {
    id: String(vendor.id ?? ''),
    name: vendor.store || vendor.name || 'Untitled store',
  }
}

export default function VendorFilterSelect({
  id,
  value = '',
  onChange,
  label = 'Vendor',
  includeAll = true,
  allLabel = 'All vendors',
  placeholder = 'Select a vendor',
  searchPlaceholder = 'Search vendors',
  loadingMessage = 'Loading vendors…',
  errorMessage = 'Could not load vendors.',
  emptyMessage = 'No vendors match that search.',
  disabled = false,
}) {
  const { data, isLoading, isError } = useAdminVendors('')
  const vendors = useMemo(() => (
    (data ?? [])
      .map(toVendorOption)
      .filter((vendor) => vendor.id)
      .sort((a, b) => a.name.localeCompare(b.name))
  ), [data])

  return (
    <SearchableOptionSelect
      id={id}
      value={value}
      onChange={onChange}
      options={vendors}
      label={label}
      includeAll={includeAll}
      allLabel={allLabel}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      loading={isLoading}
      error={isError}
      loadingMessage={loadingMessage}
      errorMessage={errorMessage}
      emptyMessage={emptyMessage}
      disabled={disabled}
    />
  )
}
