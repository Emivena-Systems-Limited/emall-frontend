import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import {
  AlertTriangle,
  Loader2,
  Package,
  RefreshCw,
  Shield,
} from 'lucide-react'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import ConfirmModal from '../components/common/ConfirmModal'
import SmartBackLink from '../components/navigation/SmartBackLink'
import ProductStorefrontPreview from '../components/products/ProductStorefrontPreview'
import ProductStatusBadge from '../components/products/ProductStatusBadge'
import ProductStatusModal from '../components/products/ProductStatusModal'
import ProductVisibilityModal from '../components/products/ProductVisibilityModal'
import { getProductConditionLabel, isDescriptiveProductImage } from '../utils/productMetadata'
import { toAdminCatalogProduct } from '../utils/normalizeAdminProducts'
import { useProduct } from '../hooks/useProducts'
import { useDeleteProductsMutation } from '../hooks/useProductMutations'
import { parseApiError } from '../utils/parseApiError'

export default function ProductDetail() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { data: rawRecord, isLoading, isError, error, refetch } = useProduct(productId)
  const deleteMutation = useDeleteProductsMutation()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [statusProduct, setStatusProduct] = useState(null)
  const [visibilityProduct, setVisibilityProduct] = useState(null)

  if (isLoading) {
    return (
      <DashboardLayout pageTitle="Product details">
        <div className="flex items-center justify-center gap-2 px-5 py-28 text-sm font-semibold text-slate-500">
          <Loader2 className="size-4 animate-spin text-brand" />
          Loading product…
        </div>
      </DashboardLayout>
    )
  }

  if (isError || !rawRecord) {
    return (
      <DashboardLayout pageTitle="Product details">
        <div className="mx-auto max-w-md space-y-5 py-20 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-100">
            <AlertTriangle className="size-6" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-950">Product not found</h1>
            <p className="mt-2 text-sm text-slate-500">
              {parseApiError(error, 'It may have been removed, or you may not have permission to view it.').message}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className="size-4" />
              Retry
            </button>
            <SmartBackLink
              fallback="/products"
              fallbackLabel="Back to catalogue"
              variant="button-primary"
            />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const product = toAdminCatalogProduct(rawRecord)
  const allImages = Array.isArray(rawRecord.images) ? rawRecord.images : []
  const images = allImages.filter((image) => !isDescriptiveProductImage(image))
  const conditionLabel = getProductConditionLabel(
    rawRecord.condition ?? rawRecord.metadata?.find?.((item) => item.key === 'condition')?.value,
  )

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({ id: product.id, approvalStatus: product.approvalStatus })
      navigate('/products')
    } catch {
      /* toast handled in mutation */
    }
  }

  return (
    <DashboardLayout pageTitle={product.name}>
      <div className="page-enter space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SmartBackLink
            fallback="/products"
            fallbackLabel="All products"
            labelStyle="short"
          />
          <div className="flex flex-wrap items-center gap-2">
            <ProductStatusBadge status={product.approvalStatus} isActive={product.isActive} />
            {product.vendorId ? (
              <Link
                to={`/vendors/${product.vendorId}`}
                className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 transition-colors hover:text-brand"
              >
                <Package className="size-3.5" />
                {product.vendorName || 'Vendor'}
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => setStatusProduct(product)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-brand/40 hover:text-brand"
            >
              <Shield className="size-3.5" />
              Review status
            </button>
          </div>
        </div>

        {product.approvalStatus === 'pending' ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <span className="font-bold">Needs review.</span> Approve it for the storefront, or send it back with a reason.
          </div>
        ) : null}

        {product.approvalStatus === 'rejected' && product.rejectionReason ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <span className="font-bold">Sent back:</span> {product.rejectionReason}
          </div>
        ) : null}

        <div className="-mx-4 sm:-mx-6 lg:-mx-8">
          <ProductStorefrontPreview
            key={product.id}
            product={product}
            rawRecord={rawRecord}
            images={images}
            conditionLabel={conditionLabel}
            actions={{
              productId: product.id,
              canActivate: !product.isActive,
              canDeactivate: product.isActive,
              canApprove: product.approvalStatus === 'pending',
              canReject: product.approvalStatus !== 'rejected',
              onActivate: () => setVisibilityProduct(product),
              onDeactivate: () => setVisibilityProduct(product),
              onApprove: () => setStatusProduct(product),
              onReject: () => setStatusProduct(product),
              onDelete: () => setShowDeleteModal(true),
            }}
          />
        </div>
      </div>

      <ConfirmModal
        open={showDeleteModal}
        title="Delete product?"
        description={`"${product.name}" will be permanently removed from the catalogue. This action cannot be undone.`}
        confirmLabel="Delete product"
        onConfirm={handleDelete}
        onClose={() => setShowDeleteModal(false)}
        isLoading={deleteMutation.isPending}
        loadingLabel="Deleting…"
        tone="danger"
      />

      <ProductStatusModal
        open={Boolean(statusProduct)}
        product={statusProduct}
        onClose={() => setStatusProduct(null)}
      />
      <ProductVisibilityModal
        open={Boolean(visibilityProduct)}
        product={visibilityProduct}
        onClose={() => setVisibilityProduct(null)}
      />
    </DashboardLayout>
  )
}
