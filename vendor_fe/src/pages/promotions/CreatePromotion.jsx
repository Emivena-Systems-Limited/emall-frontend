import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import PromotionForm from '../../components/promotions/PromotionForm'
import PromotionFormIngredientsGate from '../../components/promotions/PromotionFormIngredientsGate'
import { PROMOTION_TYPES } from '../../constants/promotions'
import { createEmptyPromotion, saveVendorPromotion } from '../../constants/promotionsData'
import { usePromotionFormIngredients } from '../../hooks/usePromotionFormIngredients'
import notify from '../../lib/notify'
import { buildPromotionPayload, validatePromotionForm } from '../../utils/promotionPayload'

export default function CreatePromotion() {
  const navigate = useNavigate()
  const {
    categoryOptions,
    productOptions,
    isLoading,
    isError,
    isReady,
    refetch,
  } = usePromotionFormIngredients()

  const initialForm = useMemo(
    () => createEmptyPromotion(PROMOTION_TYPES.FLASH_SALES),
    [],
  )
  const [form, setForm] = useState(initialForm)

  const handleSubmit = (status) => {
    const error = validatePromotionForm(form)
    if (error) {
      notify.error(error)
      return
    }

    const payload = buildPromotionPayload(form, status, { categoryOptions, productOptions })
    saveVendorPromotion(payload)
    notify.success(`"${payload.name}" created successfully.`)
    navigate('/promotions')
  }

  return (
    <DashboardLayout pageTitle="Create Promotion">
      <div className="page-enter space-y-5">
        <Link
          to="/promotions"
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-brand"
        >
          <ArrowLeft className="size-4" />
          Back to promotions
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-slate-950">Create Promotion</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create and manage promotions to boost sales and attract more customers.
          </p>
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
              onClick={() => handleSubmit('scheduled')}
              className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover"
            >
              Create Promotion
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
