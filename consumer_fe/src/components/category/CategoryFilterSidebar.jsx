import { useState } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import { Link, useNavigate } from 'react-router'

function FilterAccordionSection({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-slate-100 py-4 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-left text-sm font-bold text-slate-900"
      >
        {title}
        <ChevronDown
          className={`size-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          strokeWidth={2.25}
          aria-hidden
        />
      </button>
      {open ? <div className="mt-3">{children}</div> : null}
    </div>
  )
}

function FilterCheckboxLink({ to, label, checked }) {
  return (
    <Link to={to} className="group flex items-center gap-2.5">
      <span
        className={`flex size-4 shrink-0 items-center justify-center rounded border transition-colors ${
          checked
            ? 'border-auth-primary bg-auth-primary text-white'
            : 'border-slate-300 bg-white text-transparent group-hover:border-auth-primary/50'
        }`}
      >
        <Check className="size-3" strokeWidth={3} aria-hidden />
      </span>
      <span
        className={`truncate text-sm ${
          checked ? 'font-semibold text-slate-900' : 'text-slate-600 group-hover:text-slate-900'
        }`}
      >
        {label}
      </span>
    </Link>
  )
}

function FilterEmptyMessage({ text = 'No options available yet.' }) {
  return <p className="text-xs leading-relaxed text-slate-400 sm:text-[0.8125rem]">{text}</p>
}

function FilterOptionsSkeleton({ count = 4 }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="h-4 w-4/5 animate-pulse rounded bg-slate-100" />
      ))}
    </div>
  )
}

export default function CategoryFilterSidebar({
  parentCategories = [],
  subcategories = [],
  currentSlug,
  currentSubSlug,
  isLoading = false,
}) {
  const navigate = useNavigate()

  const handleClearAll = () => {
    if (currentSlug) navigate(`/categories/${currentSlug}`)
  }

  return (
    <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)] lg:w-64 lg:overflow-hidden xl:w-72">
      <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
        <div className="shrink-0 border-b border-slate-100 p-5 pb-4 sm:p-6 sm:pb-5">
          <h2 className="text-base font-bold text-slate-950 sm:text-lg">Filters</h2>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">Narrow your search</p>

          <div className="relative mt-4">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              strokeWidth={2}
              aria-hidden
            />
            <input
              type="search"
              placeholder="Search products"
              aria-label="Search products"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pr-3 pl-9 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-auth-primary focus:bg-white focus:ring-1 focus:ring-auth-primary/30"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 sm:px-6">
          <FilterAccordionSection title="Categories" defaultOpen>
            {isLoading ? (
              <FilterOptionsSkeleton />
            ) : parentCategories.length ? (
              <ul className="space-y-2.5">
                {parentCategories.map((category) => (
                  <li key={category.id}>
                    <FilterCheckboxLink
                      to={`/categories/${category.slug}`}
                      label={category.name}
                      checked={category.slug === currentSlug}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <FilterEmptyMessage />
            )}
          </FilterAccordionSection>

          <FilterAccordionSection title="Sub-categories" defaultOpen>
            {isLoading ? (
              <FilterOptionsSkeleton />
            ) : subcategories.length ? (
              <ul className="space-y-2.5">
                {subcategories.map((subcategory) => (
                  <li key={subcategory.id}>
                    <FilterCheckboxLink
                      to={`/categories/${currentSlug}/${subcategory.slug}`}
                      label={subcategory.name}
                      checked={subcategory.slug === currentSubSlug}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <FilterEmptyMessage text="No sub-categories yet." />
            )}
          </FilterAccordionSection>

          <FilterAccordionSection title="Brand">
            <FilterEmptyMessage text="Brand filters will appear once products are live." />
          </FilterAccordionSection>

          <FilterAccordionSection title="Color">
            <FilterEmptyMessage text="Color filters will appear once products are live." />
          </FilterAccordionSection>

          <FilterAccordionSection title="Size">
            <FilterEmptyMessage text="Size filters will appear once products are live." />
          </FilterAccordionSection>

          <FilterAccordionSection title="Price">
            <FilterEmptyMessage text="Price filters will appear once products are live." />
          </FilterAccordionSection>
        </div>

        <div className="shrink-0 border-t border-slate-200 p-5 sm:p-6">
          <label htmlFor="category-store-filter" className="mb-2 block text-sm font-semibold text-slate-900">
            Stores
          </label>
          <select
            id="category-store-filter"
            disabled
            defaultValue="all"
            className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500"
          >
            <option value="all">All Stores</option>
          </select>

          <button
            type="button"
            onClick={handleClearAll}
            className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:border-auth-primary hover:text-auth-primary"
          >
            Clear All
          </button>
        </div>
      </div>
    </aside>
  )
}
