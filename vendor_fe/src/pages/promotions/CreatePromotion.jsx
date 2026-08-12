import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import PromotionForm from '../../components/promotions/PromotionForm'
import PromotionFormActions from '../../components/promotions/PromotionFormActions'
import PromotionFormIngredientsGate from '../../components/promotions/PromotionFormIngredientsGate'
import { createEmptyPromotion } from '../../mocks/promotionMockData'
import {
  useCreatePromotionMutation,
  useSaveDraftMutation,
} from '../../hooks/usePromotions'
import { usePromotionFormIngredients } from '../../hooks/usePromotionFormIngredients'
import notify from '../../lib/notify'
import {
  buildPromotionPayload,
  isPromotionFormDirty,
  validatePromotionDraft,
  validatePromotionForm,
} from '../../utils/promotionPayload'

export default function CreatePromotion() {
  const navigate = useNavigate()
  const initialForm = useMemo(() => createEmptyPromotion(), [])
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [discardOpen, setDiscardOpen] = useState(false)

  const {
    categoryOptions,
    productOptions,
    isLoading,
    isError,
    isReady,
    refetch,
  } = usePromotionFormIngredients()

  const createMutation = useCreatePromotionMutation()
  const draftMutation = useSaveDraftMutation()
  const isSubmitting = createMutation.isPending || draftMutation.isPending

  const handleCancel = () => {
    if (isPromotionFormDirty(form, initialForm)) {
      setDiscardOpen(true)
      return
    }
    navigate('/promotions')
  }

  const handleSaveDraft = async () => {
    const validation = validatePromotionDraft(form)
    setErrors(validation.errors)
    if (!validation.isValid) return

    try {
      const payload = buildPromotionPayload(form, 'draft', { categoryOptions, productOptions })
      await draftMutation.mutateAsync(payload)
      notify.success('Promotion saved as draft.')
      navigate('/promotions')
    } catch {
      notify.error('We couldn\'t save this draft. Please try again.')
    }
  }

  const handleSubmit = async () => {
    const validation = validatePromotionForm(form, { mode: 'publish' })
    setErrors(validation.errors)
    if (!validation.isValid) {
      if (validation.firstError) notify.error(validation.firstError)
      return
    }

    try {
      const payload = buildPromotionPayload(form, 'scheduled', { categoryOptions, productOptions })
      await createMutation.mutateAsync(payload)
      notify.success('Promotion created successfully.')
      navigate('/promotions')
    } catch {
      notify.error('We couldn\'t create this promotion. Please try again.')
    }
  }

  return (
    <DashboardLayout pageTitle="Create Promotion">
      <div className="page-enter space-y-5">
        <button
          type="button"
          onClick={handleCancel}
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-brand"
        >
          <ArrowLeft className="size-4" />
          Back to promotions
        </button>

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
              onChange={(next) => {
                setForm(next)
                setErrors({})
              }}
              errors={errors}
              categoryOptions={categoryOptions}
              productOptions={productOptions}
            />
          )}
        </PromotionFormIngredientsGate>

        {isReady && (
          <PromotionFormActions
            mode="create"
            isDirty={isPromotionFormDirty(form, initialForm)}
            isSubmitting={isSubmitting}
            discardOpen={discardOpen}
            onDiscardClose={() => setDiscardOpen(false)}
            onDiscardConfirm={() => navigate('/promotions')}
            onCancel={handleCancel}
            onSaveDraft={handleSaveDraft}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
