import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import PromotionForm from '../../components/promotions/PromotionForm'
import PromotionFormIngredientsGate from '../../components/promotions/PromotionFormIngredientsGate'
import { getPromotionById, saveVendorPromotion } from '../../constants/promotionsData'
import { usePromotionFormIngredients } from '../../hooks/usePromotionFormIngredients'
import notify from '../../lib/notify'
import { buildPromotionPayload, validatePromotionForm } from '../../utils/promotionPayload'

export default function EditPromotion() {
  const { promotionId } = useParams()
  const navigate = useNavigate()
  const existing = useMemo(() => getPromotionById(promotionId), [promotionId])
  const [form, setForm] = useState(existing)

  const {
    categoryOptions,
    productOptions,
    isLoading,
    isError,
    isReady,
    refetch,
  } = usePromotionFormIngredients()

  if (!form) {
    return (
      <DashboardLayout pageTitle="Edit Promotion">
        <div className="page-enter rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-sm text-slate-600">Promotion not found.</p>
          <Link to="/promotions" className="mt-4 inline-flex text-sm font-bold text-cyan-700 hover:text-cyan-900">
            Back to promotions
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const persistForm = (statusOverride) => {
    const error = validatePromotionForm(form)
    if (error) {
      notify.error(error)
      return
    }

    const payload = buildPromotionPayload(
      statusOverride ? { ...form, status: statusOverride } : form,
      statusOverride ?? form.status,
      { categoryOptions, productOptions },
    )
    saveVendorPromotion(payload)
    notify.success(`"${form.name}" updated successfully.`)
    navigate('/promotions')
  }

  return (
    <DashboardLayout pageTitle="Edit Promotion">
      <div className="page-enter space-y-5">
        <Link
          to="/promotions"
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-brand"
        >
          <ArrowLeft className="size-4" />
          Back to promotions
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-slate-950">Edit Promotion</h1>
          <p className="mt-1 text-sm text-slate-500">Update promotion settings and schedule.</p>
        </div>

        <PromotionFormIngredientsGate
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
        >
          {isReady && (
            <PromotionForm
              form={form}
              onChange={setForm}
              showTypeSelection
              categoryOptions={categoryOptions}
              productOptions={productOptions}
            />
          )}
        </PromotionFormIngredientsGate>

        {isReady && (
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              to="/promotions"
              className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={() => persistForm()}
              className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
