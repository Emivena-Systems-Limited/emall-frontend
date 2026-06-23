import { useEffect, useRef, useState } from 'react'
import {
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  Search,
} from 'lucide-react'

const DEFAULT_CATEGORY_OPTIONS = [{ value: '', label: 'All categories' }]
const DEFAULT_BRAND_OPTIONS = [{ value: '', label: 'All brands' }]

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="block min-w-[160px] flex-1">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm text-slate-900 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand-light"
        >
          {options.map((option) => (
            <option key={option.value || 'all'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-400" />
      </div>
    </label>
  )
}

function ExportMenu({ onExportExcel, onExportPdf }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClick = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
      >
        <Download className="size-4" />
        Export
        <ChevronDown className="size-4 text-slate-400" />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
          <button
            type="button"
            onClick={() => {
              onExportExcel()
              setOpen(false)
            }}
            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
          >
            <FileSpreadsheet className="size-4 text-emerald-600" />
            Excel
          </button>
          <button
            type="button"
            onClick={() => {
              onExportPdf()
              setOpen(false)
            }}
            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
          >
            <FileText className="size-4 text-red-600" />
            PDF
          </button>
        </div>
      )}
    </div>
  )
}

export default function ProductCatalogToolbar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  brand,
  onBrandChange,
  categoryOptions = DEFAULT_CATEGORY_OPTIONS,
  brandOptions = DEFAULT_BRAND_OPTIONS,
  onExportExcel,
  onExportPdf,
  selectedCount,
  onActivateSelected,
  onDeactivateSelected,
  onDeleteSelected,
  onExportSelected,
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <label className="block min-w-0 flex-1">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Search
          </span>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search by name, SKU, brand, or category…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-3 pl-10 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand-light"
            />
          </div>
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <FilterSelect
            label="Category"
            value={category}
            onChange={onCategoryChange}
            options={categoryOptions}
          />
          <FilterSelect
            label="Brand"
            value={brand}
            onChange={onBrandChange}
            options={brandOptions}
          />
          <ExportMenu onExportExcel={onExportExcel} onExportPdf={onExportPdf} />
        </div>
      </div>

      {selectedCount > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-brand/20 bg-brand-light/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-slate-800">
            {selectedCount} product{selectedCount === 1 ? '' : 's'} selected
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onActivateSelected}
              className="cursor-pointer rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
            >
              Activate selected
            </button>
            <button
              type="button"
              onClick={onDeactivateSelected}
              className="cursor-pointer rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
            >
              Deactivate selected
            </button>
            <button
              type="button"
              onClick={onDeleteSelected}
              className="cursor-pointer rounded-lg bg-white px-3 py-2 text-xs font-semibold text-red-600 ring-1 ring-red-200 transition-colors hover:bg-red-50"
            >
              Delete selected
            </button>
            <button
              type="button"
              onClick={onExportSelected}
              className="cursor-pointer rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-hover"
            >
              Export selected
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
