import { Loader2, Eye, EyeOff } from 'lucide-react'
import { useToggleProductActiveMutation } from '../../hooks/useAdminProducts'
import VendorDialog, { VendorDialogBody, VendorDialogFooter, VendorDialogHeader } from '../vendors/VendorDialog'
import ProductIdentity from './ProductIdentity'

export default function ProductVisibilityModal({ open, product, onClose }) {
  if (!open || !product) return null
  return <ProductVisibilityForm key={product.id} product={product} onClose={onClose} />
}

function ProductVisibilityForm({ product, onClose }) {
  const mutation = useToggleProductActiveMutation()
  const busy = mutation.isPending
  const hiding = product.isActive

  const handleClose = () => {
    if (busy) return
    onClose()
  }

  const handleConfirm = async () => {
    try {
      await mutation.mutateAsync({ id: product.id })
      onClose()
    } catch {
      // Toast is handled by the mutation.
    }
  }

  return (
    <VendorDialog open onClose={handleClose} labelledBy="product-visibility-title" widthClass="max-w-md">
      <VendorDialogHeader
        id="product-visibility-title"
        icon={hiding ? EyeOff : Eye}
        title={hiding ? 'Hide this listing?' : 'Show this listing?'}
        subtitle={hiding ? 'Shoppers will no longer see it on the storefront' : 'Shoppers can find it when the listing is approved'}
        onClose={handleClose}
      />
      <VendorDialogBody className="px-5 py-5 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-3">
          <ProductIdentity product={product} />
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
          onClick={handleConfirm}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {hiding ? 'Hide from shoppers' : 'Show on storefront'}
        </button>
      </VendorDialogFooter>
    </VendorDialog>
  )
}
