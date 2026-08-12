import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, Loader2 } from 'lucide-react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import PromotionForm from '../../components/promotions/PromotionForm'
import PromotionFormActions from '../../components/promotions/PromotionFormActions'
import PromotionFormIngredientsGate from '../../components/promotions/PromotionFormIngredientsGate'
import {
  usePromotion,
  useSaveDraftMutation,
  useUpdatePromotionMutation,
} from '../../hooks/usePromotions'
import { usePromotionFormIngredients } from '../../hooks/usePromotionFormIngredients'
import notify from '../../lib/notify'
import {
  buildPromotionPayload,
  isPromotionFormDirty,
  validatePromotionDraft,
  validatePromotionForm,
} from '../../utils/promotionPayload'

export default function EditPromotion() {
  const { promotionId } = useParams()
  const navigate = useNavigate()
  const { data: existing, isLoading: isPromotionLoading, isError } = usePromotion(promotionId)
  const [form, setForm] = useState(null)
  const [initialForm, setInitialForm] = useState(null)
  const [errors, setErrors] = useState({})
  const [discardOpen, setDiscardOpen] = useState(false)

  const {
    categoryOptions,
    productOptions,
    isLoading: isIngredientsLoading,
    isError: isIngredientsError,
    isReady,
    refetch,
  } = usePromotionFormIngredients()

  const updateMutation = useUpdatePromotionMutation()
  const draftMutation = useSaveDraftMutation()
  const isSubmitting = updateMutation.isPending || draftMutation.isPending

  useEffect(() => {
    if (!existing) return
    setForm(existing)
    setInitialForm(existing)
  }, [existing])

  const handleCancel = () => {
    if (initialForm && form && isPromotionFormDirty(form, initialForm)) {
      setDiscardOpen(true)
      return
    }
    navigate('/promotions')
  }

  const handleSaveDraft = async () => {
    if (!form) return
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
    if (!form) return
    const validation = validatePromotionForm(form, { mode: 'publish' })
    setErrors(validation.errors)
    if (!validation.isValid) {
      if (validation.firstError) notify.error(validation.firstError)
      return
    }

    try {
      const payload = buildPromotionPayload(form, form.status === 'draft' ? 'scheduled' : form.status, {
        categoryOptions,
        productOptions,
      })
      await updateMutation.mutateAsync({ promotionId, promotion: payload })
      notify.success(`"${form.name}" updated successfully.`)
      navigate('/promotions')
    } catch {
      notify.error('We couldn\'t update this promotion. Please try again.')
    }
  }

  if (isPromotionLoading) {
    return (
      <DashboardLayout pageTitle="Edit Promotion">
        <div className="page-enter flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-24 text-sm font-semibold text-slate-500">
          <Loader2 className="size-4 animate-spin text-brand" />
          Loading promotion…
        </div>
      </DashboardLayout>
    )
  }

  if (isError || !form) {
    return (
      <DashboardLayout pageTitle="Edit Promotion">
        <div className="page-enter rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-sm text-slate-600">Promotion not found.</p>
          <Link to="/promotions" className="mt-4 inline-flex text-sm font-bold text-brand hover:underline">
            Back to promotions
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout pageTitle="Edit Promotion">
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
          <h1 className="text-2xl font-bold text-slate-950">Edit Promotion</h1>
          <p className="mt-1 text-sm text-slate-500">Update promotion settings and schedule.</p>
        </div>

        <PromotionFormIngredientsGate
          isLoading={isIngredientsLoading}
          isError={isIngredientsError}
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
              showTypeSelection
              categoryOptions={categoryOptions}
              productOptions={productOptions}
            />
          )}
        </PromotionFormIngredientsGate>

        {isReady && (
          <PromotionFormActions
            mode="edit"
            isDirty={initialForm ? isPromotionFormDirty(form, initialForm) : false}
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
