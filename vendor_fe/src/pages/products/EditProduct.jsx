import { Link, useParams } from 'react-router'
import { AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import { useProduct } from '../../hooks/useProducts'
import { mapProductRecordToFormState } from '../../utils/mapProductToFormValues'
import { ProductListingForm } from './AddProduct'

export default function EditProduct() {
  const { productId } = useParams()
  const { data: product, isLoading, isError, refetch } = useProduct(productId)
  const formState = product ? mapProductRecordToFormState(product) : null

  if (isLoading) {
    return (
      <DashboardLayout pageTitle="Edit Product">
        <div className="flex items-center justify-center gap-2 px-5 py-24 text-sm font-semibold text-slate-500">
          <Loader2 className="size-4 animate-spin text-brand" />
          Loading product details…
        </div>
      </DashboardLayout>
    )
  }

  if (isError || !formState) {
    return (
      <DashboardLayout pageTitle="Edit Product">
        <div className="page-enter mx-auto max-w-xl space-y-4 px-5 py-16 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100">
            <AlertTriangle className="size-6" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-950">Product not found</h1>
            <p className="mt-2 text-sm text-slate-600">
              We could not load this product. It may have been removed or you may not have access.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:border-slate-300"
            >
              Try again
            </button>
            <Link
              to="/products"
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover"
            >
              <ArrowLeft className="size-4" />
              Back to products
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <ProductListingForm
      mode="edit"
      productId={productId}
      initialFormValues={formState.formValues}
      initialMainImage={formState.mainImage}
      initialSubImages={formState.subImages}
    />
  )
}
