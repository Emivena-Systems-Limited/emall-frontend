import { Loader2, MessageSquareText } from 'lucide-react'
import VendorDialog, { VendorDialogBody, VendorDialogFooter, VendorDialogHeader } from '../vendors/VendorDialog'
import { useProduct } from '../../hooks/useProducts'
import { toAdminCatalogProduct } from '../../utils/normalizeAdminProducts'
import ProductIdentity from './ProductIdentity'

export default function ProductRejectionReasonModal({ open, product, onClose }) {
  const { data: rawRecord, isLoading, isError } = useProduct(open ? product?.id : null)
  const loaded = rawRecord ? toAdminCatalogProduct(rawRecord) : null
  const reason = loaded?.rejectionReason || product?.rejectionReason || ''

  if (!open || !product) return null

  return (
    <VendorDialog open onClose={onClose} labelledBy="product-rejection-reason-title" widthClass="max-w-lg">
      <VendorDialogHeader
        id="product-rejection-reason-title"
        icon={MessageSquareText}
        iconClass="bg-red-50 text-red-700"
        title="Rejection reason"
        subtitle={product.name}
        onClose={onClose}
      />
      <VendorDialogBody className="space-y-4 px-5 py-5 sm:px-6">
        <ProductIdentity product={product} />
        {isLoading && !reason ? (
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            <Loader2 className="size-4 animate-spin text-brand" />
            Loading reason…
          </p>
        ) : (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-950 ring-1 ring-red-100">
            {reason || (isError ? 'The rejection reason could not be loaded.' : 'No rejection reason was saved for this listing.')}
          </p>
        )}
      </VendorDialogBody>
      <VendorDialogFooter>
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          Close
        </button>
      </VendorDialogFooter>
    </VendorDialog>
  )
}
