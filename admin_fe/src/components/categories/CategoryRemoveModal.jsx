import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Loader2, Trash2, X } from 'lucide-react'
import VendorDialog, { VendorDialogFooter } from '../vendors/VendorDialog'
import CategoryImage from './CategoryImage'
import CategoryStatusBadge from './CategoryStatusBadge'
import { useDeleteCategoryMutation } from '../../hooks/useAdminCategories'
import { countNestedCategories, getCategoryDisplayImage } from '../../utils/normalizeAdminCategories'
import { formatCount } from '../../utils/formatters'

export default function CategoryRemoveModal({ open, category, onClose }) {
  if (!open || !category) return null
  return <CategoryRemoveForm key={category.id} category={category} onClose={onClose} />
}

function CategoryRemoveForm({ category, onClose }) {
  const mutation = useDeleteCategoryMutation()
  const busy = mutation.isPending
  const nested = category.children ?? []
  const nestedCount = countNestedCategories(category)
  const isDepartment = !category.parentId
  const needsAck = nestedCount > 0
  const [acknowledged, setAcknowledged] = useState(false)
  const cancelRef = useRef(null)
  const canRemove = !busy && (!needsAck || acknowledged)
  const previewNames = nested.slice(0, 4)
  const extraCount = Math.max(nested.length - previewNames.length, 0)

  useEffect(() => {
    cancelRef.current?.focus()
  }, [])

  const handleClose = () => {
    if (busy) return
    onClose()
  }

  const handleConfirm = async () => {
    if (!canRemove) return
    try {
      await mutation.mutateAsync({ id: category.id })
      onClose()
    } catch {
      // Toast is handled by the mutation.
    }
  }

  return (
    <VendorDialog open onClose={handleClose} labelledBy="category-remove-title" widthClass="max-w-md">
      <div className="relative overflow-hidden">
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-rose-600" />
        <div className="flex items-start justify-between gap-3 px-5 pt-5 sm:px-6">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-700 ring-1 ring-rose-100">
            <Trash2 className="size-5" strokeWidth={2} aria-hidden="true" />
          </span>
          <button
            type="button"
            onClick={handleClose}
            disabled={busy}
            className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="px-5 pt-4 sm:px-6">
          <h2 id="category-remove-title" className="text-xl font-bold tracking-tight text-slate-950">
            Remove this {isDepartment ? 'department' : 'subcategory'}?
          </h2>
          <p id="category-remove-copy" className="mt-1.5 text-sm leading-relaxed text-slate-500">
            This takes it out of the catalogue. Listings that used it will need another category.
          </p>
        </div>
      </div>

      <div className="space-y-3 px-5 py-4 sm:px-6" aria-describedby="category-remove-copy">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-3">
          <CategoryImage
            src={getCategoryDisplayImage(category, Boolean(category.parentId))}
            size="lg"
            roundedClass="rounded-2xl"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-slate-900">{category.name}</p>
            <div className="mt-2">
              <CategoryStatusBadge active={category.isActive} featured={category.isFeatured} />
            </div>
          </div>
        </div>

        {nestedCount > 0 ? (
          <div className="rounded-2xl bg-rose-50 px-4 py-3 ring-1 ring-rose-100">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-rose-700" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-rose-950">
                  {formatCount(nestedCount)} nested {nestedCount === 1 ? 'subcategory' : 'subcategories'} may be removed with it
                </p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {previewNames.map((child) => (
                    <li
                      key={child.id}
                      className="max-w-full truncate rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-rose-800 ring-1 ring-rose-100"
                    >
                      {child.name}
                    </li>
                  ))}
                  {extraCount > 0 ? (
                    <li className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-rose-800 ring-1 ring-rose-100">
                      +{formatCount(extraCount)} more
                    </li>
                  ) : null}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200">
            Nothing is nested under this one. Only this category will leave the catalogue.
          </p>
        )}

        {needsAck ? (
          <label htmlFor="category-remove-ack" className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white px-3.5 py-3">
            <input
              id="category-remove-ack"
              type="checkbox"
              checked={acknowledged}
              disabled={busy}
              onChange={(event) => setAcknowledged(event.target.checked)}
              className="mt-0.5 size-4 rounded border-slate-300 text-rose-700 focus:ring-rose-600"
            />
            <span className="text-sm font-medium text-slate-700">
              I understand the nested subcategories may be removed too.
            </span>
          </label>
        ) : null}
      </div>

      <VendorDialogFooter>
        <button
          ref={cancelRef}
          type="button"
          disabled={busy}
          onClick={handleClose}
          className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Keep category
        </button>
        <button
          type="button"
          disabled={!canRemove}
          onClick={handleConfirm}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-rose-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          Remove {isDepartment ? 'department' : 'subcategory'}
        </button>
      </VendorDialogFooter>
    </VendorDialog>
  )
}
