import { useMemo } from 'react'
import { useParentCategories } from '../../hooks/useAdminCategories'
import SearchableOptionSelect from './SearchableOptionSelect'

function toCategoryOption(category) {
  return {
    id: String(category.id ?? ''),
    name: category.name || 'Untitled category',
  }
}

export default function CategoryFilterSelect({
  id,
  value = '',
  onChange,
  label = 'Category',
  includeAll = false,
  placeholder = 'Select a category',
  disabled = false,
}) {
  const { data, isLoading, isError } = useParentCategories()
  const categories = useMemo(() => (
    (data ?? [])
      .filter((category) => !category.parentId)
      .map(toCategoryOption)
      .filter((category) => category.id)
      .sort((a, b) => a.name.localeCompare(b.name))
  ), [data])

  return (
    <SearchableOptionSelect
      id={id}
      value={value}
      onChange={onChange}
      options={categories}
      label={label}
      includeAll={includeAll}
      allLabel="All categories"
      placeholder={placeholder}
      searchPlaceholder="Search categories"
      loading={isLoading}
      error={isError}
      loadingMessage="Loading categories…"
      errorMessage="Could not load categories."
      emptyMessage="No categories match that search."
      disabled={disabled}
    />
  )
}
