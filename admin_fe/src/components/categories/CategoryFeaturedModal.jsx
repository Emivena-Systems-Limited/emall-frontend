import { Loader2, Star, StarOff } from 'lucide-react'
import VendorDialog, { VendorDialogBody, VendorDialogFooter, VendorDialogHeader } from '../vendors/VendorDialog'
import CategoryIdentity from './CategoryIdentity'
import CategoryStatusBadge from './CategoryStatusBadge'
import { useToggleCategoryFeaturedMutation } from '../../hooks/useAdminCategories'

export default function CategoryFeaturedModal({ open, category, onClose }) {
  if (!open || !category) return null
  return <CategoryFeaturedForm key={category.id} category={category} onClose={onClose} />
}

function CategoryFeaturedForm({ category, onClose }) {
  const mutation = useToggleCategoryFeaturedMutation()
  const busy = mutation.isPending
  const featured = Boolean(category.isFeatured)
  const kind = category.parentId ? 'subcategory' : 'department'

  const handleClose = () => {
    if (busy) return
    onClose()
  }

  const handleSave = async () => {
    try {
      await mutation.mutateAsync({
        id: category.id,
        currentlyFeatured: featured,
      })
      onClose()
    } catch {
      // Toast is handled by the mutation.
    }
  }

  return (
    <VendorDialog open onClose={handleClose} labelledBy="category-featured-title" widthClass="max-w-lg">
      <VendorDialogHeader
        id="category-featured-title"
        icon={featured ? StarOff : Star}
        title={featured ? 'Remove this from featured?' : 'Feature this category?'}
        subtitle={featured
          ? 'It stays in the catalogue, but it will no longer be highlighted on the storefront.'
          : 'Featured categories are easier for shoppers to notice on the storefront.'}
        onClose={handleClose}
      />

      <VendorDialogBody className="space-y-4 px-5 py-5 sm:px-6">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-3">
          <CategoryIdentity category={category} nested={Boolean(category.parentId)} />
          <CategoryStatusBadge active={category.isActive} featured={featured} />
        </div>
      </VendorDialogBody>

      <VendorDialogFooter>
        <button
          type="button"
          disabled={busy}
          onClick={handleClose}
          className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={handleSave}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {featured ? `Remove featured` : `Feature ${kind}`}
        </button>
      </VendorDialogFooter>
    </VendorDialog>
  )
}
