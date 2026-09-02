import { Pencil, Shield, Trash2 } from 'lucide-react'

export default function BrandActions({ brand, onEdit, onStatus, onRemove }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onEdit?.(brand)
        }}
        aria-label={`Edit ${brand.name}`}
        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <Pencil className="size-3.5" strokeWidth={2} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onStatus?.(brand)
        }}
        aria-label={`Update status for ${brand.name}`}
        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-brand-light hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <Shield className="size-3.5" strokeWidth={2} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onRemove?.(brand)
        }}
        aria-label={`Remove ${brand.name}`}
        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <Trash2 className="size-3.5" strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  )
}
