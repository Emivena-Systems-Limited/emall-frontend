import { Pencil, Plus, Trash2 } from 'lucide-react'

export default function CategoryActions({ category, onAddChild, onEdit, onRemove }) {
  return (
    <div className="flex items-center justify-end gap-1">
      {onAddChild ? (
        <button
          type="button"
          onClick={() => onAddChild(category)}
          aria-label={`Add subcategory under ${category.name}`}
          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-brand-light hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <Plus className="size-3.5" strokeWidth={2} aria-hidden="true" />
        </button>
      ) : null}
      <button
        type="button"
        onClick={() => onEdit?.(category)}
        aria-label={`Edit ${category.name}`}
        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <Pencil className="size-3.5" strokeWidth={2} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => onRemove?.(category)}
        aria-label={`Remove ${category.name}`}
        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <Trash2 className="size-3.5" strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  )
}
