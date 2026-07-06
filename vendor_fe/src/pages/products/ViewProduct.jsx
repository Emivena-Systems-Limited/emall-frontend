import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import {
  AlertTriangle,
  ArrowLeft,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { getProductConditionLabel, isDescriptiveProductImage } from '../../utils/productMetadata'
import ConfirmModal from '../../components/common/ConfirmModal'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import OrderProductSwitcher from '../../components/orders/OrderProductSwitcher'
import ProductStorefrontPreview from '../../components/products/ProductStorefrontPreview'
import { getOrderById } from '../../constants/ordersData'
import { useProduct } from '../../hooks/useProducts'
import { useDeleteProductsMutation, useUpdateProductStatusMutation } from '../../hooks/useProductMutations'
import { toCatalogProduct } from '../../utils/normalizeProducts'
import {
  canActivateProduct,
  canDeactivateProduct,
  getProductStatusActionCopy,
} from '../../utils/productStatusActions'
import { getUniqueOrderProducts } from '../../utils/orderProductNavigation'

export default function ViewProduct() {
  const { productId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const orderId = searchParams.get('orderId')
  const linkedOrder = orderId ? getOrderById(orderId) : null
  const orderProducts = linkedOrder ? getUniqueOrderProducts(linkedOrder) : []
  const { data: rawRecord, isLoading, isError, refetch } = useProduct(productId)
  const deleteMutation = useDeleteProductsMutation()
  const updateProductStatusMutation = useUpdateProductStatusMutation()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [statusRequest, setStatusRequest] = useState(null)

  if (isLoading) {
    return (
      <DashboardLayout pageTitle="Product Details">
        <div className="flex items-center justify-center gap-2 px-5 py-28 text-sm font-semibold text-slate-500">
          <Loader2 className="size-4 animate-spin text-brand" />
          Loading product…
        </div>
      </DashboardLayout>
    )
  }

  if (isError || !rawRecord) {
    return (
      <DashboardLayout pageTitle="Product Details">
        <div className="mx-auto max-w-md space-y-5 py-20 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-100">
            <AlertTriangle className="size-6" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-950">Product not found</h1>
            <p className="mt-2 text-sm text-slate-500">
              It may have been removed or you may not have permission to view it.
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
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-hover"
            >
              <ArrowLeft className="size-4" />
              Back to products
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const product = toCatalogProduct(rawRecord)
  const allImages = Array.isArray(rawRecord.images) ? rawRecord.images : []
  const images = allImages.filter((image) => !isDescriptiveProductImage(image))
  const conditionLabel = getProductConditionLabel(
    rawRecord.condition ?? rawRecord.metadata?.find?.((item) => item.key === 'condition')?.value,
  )

  const statusModalCopy = statusRequest
    ? getProductStatusActionCopy({
      product: statusRequest.product,
      status: statusRequest.status,
    })
    : null

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync([product.id])
      navigate('/products')
    } catch {
      /* toast handled in mutation */
    }
  }

  const handleConfirmStatusChange = async () => {
    if (!statusRequest) return

    try {
      await updateProductStatusMutation.mutateAsync({
        productId: statusRequest.product.id,
        status: statusRequest.status,
      })
      setStatusRequest(null)
    } catch {
      /* toast handled in mutation */
    }
  }

  return (
    <DashboardLayout pageTitle={product.name}>
      <div className="page-enter space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to={orderId ? `/orders/${orderId}` : '/products'}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-800"
          >
            <ArrowLeft className="size-4" />
            {orderId ? 'Back to order' : 'All Products'}
          </Link>

          {orderId && orderProducts.length > 1 && (
            <OrderProductSwitcher
              orderId={orderId}
              products={orderProducts}
              currentProductId={productId}
            />
          )}
        </div>

        <div className="-mx-4 sm:-mx-6 lg:-mx-8">
          <ProductStorefrontPreview
            key={product.id}
            product={product}
            rawRecord={rawRecord}
            images={images}
            conditionLabel={conditionLabel}
            actions={{
              productId: product.id,
              canActivate: canActivateProduct(product.status),
              canDeactivate: canDeactivateProduct(product.status),
              onActivate: () => setStatusRequest({ product, status: 'active' }),
              onDeactivate: () => setStatusRequest({ product, status: 'inactive' }),
              onDelete: () => setShowDeleteModal(true),
            }}
          />
        </div>
      </div>

      <ConfirmModal
        open={showDeleteModal}
        title="Delete product?"
        description={`"${product.name}" will be permanently removed from your catalogue. This action cannot be undone.`}
        confirmLabel="Delete product"
        onConfirm={handleDelete}
        onClose={() => setShowDeleteModal(false)}
        isLoading={deleteMutation.isPending}
        loadingLabel="Deleting…"
        tone="danger"
      />

      <ConfirmModal
        open={Boolean(statusRequest && statusModalCopy)}
        title={statusModalCopy?.title}
        description={statusModalCopy?.description}
        confirmLabel={statusModalCopy?.confirmLabel}
        onConfirm={handleConfirmStatusChange}
        onClose={() => {
          if (updateProductStatusMutation.isPending) return
          setStatusRequest(null)
        }}
        isLoading={updateProductStatusMutation.isPending}
        loadingLabel={statusModalCopy?.loadingLabel}
        tone={statusModalCopy?.tone}
      />
    </DashboardLayout>
  )
}
