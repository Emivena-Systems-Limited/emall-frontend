import { Link, useParams } from 'react-router'
import { ArrowLeft, Calendar, ShoppingBag, Tag } from 'lucide-react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import PromotionForm from '../../components/promotions/PromotionForm'
import PromotionFormIngredientsGate from '../../components/promotions/PromotionFormIngredientsGate'
import PromotionStatusBadge from '../../components/promotions/PromotionStatusBadge'
import {
  DISCOUNT_TYPE_OPTIONS,
  PROMOTION_TYPE_CONFIG,
} from '../../constants/promotions'
import { getPromotionById } from '../../constants/promotionsData'
import { usePromotionFormIngredients } from '../../hooks/usePromotionFormIngredients'

function formatMoney(amount) {
  return `GH₵ ${Number(amount).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`
}

function formatDateTime(value) {
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-950">{value}</p>
    </div>
  )
}

export default function ViewPromotion() {
  const { promotionId } = useParams()
  const promotion = getPromotionById(promotionId)
  const {
    categoryOptions,
    productOptions,
    isLoading,
    isError,
    isReady,
    refetch,
  } = usePromotionFormIngredients()

  if (!promotion) {
    return (
      <DashboardLayout pageTitle="Promotion details">
        <div className="page-enter rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-sm text-slate-600">Promotion not found.</p>
          <Link to="/promotions" className="mt-4 inline-flex text-sm font-bold text-cyan-700 hover:text-cyan-900">
            Back to promotions
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const discountLabel =
    DISCOUNT_TYPE_OPTIONS.find((option) => option.value === promotion.discountType)?.label
    ?? promotion.discountType

  return (
    <DashboardLayout pageTitle="Promotion details">
      <div className="page-enter space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/promotions"
            className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-brand"
          >
            <ArrowLeft className="size-4" />
            Back to promotions
          </Link>

          <Link
            to={`/promotions/${promotion.id}/edit`}
            className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover"
          >
            Edit Promotion
          </Link>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Promotion</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-950">{promotion.name}</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">{promotion.shortDescription}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <PromotionStatusBadge status={promotion.status} />
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                  <Tag className="size-3.5" />
                  {PROMOTION_TYPE_CONFIG[promotion.type]?.label ?? promotion.type}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <StatCard label="Orders" value={promotion.orders} />
              <StatCard label="Revenue" value={formatMoney(promotion.revenue)} />
              <StatCard label="Discount" value={discountLabel} />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 ring-1 ring-slate-200">
              <Calendar className="size-4" />
            </span>
            <h2 className="text-sm font-bold text-slate-950">Schedule & Performance</h2>
          </div>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-100 px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Start</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-800">{formatDateTime(promotion.startDate)}</dd>
            </div>
            <div className="rounded-xl border border-slate-100 px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">End</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-800">{formatDateTime(promotion.endDate)}</dd>
            </div>
            <div className="rounded-xl border border-slate-100 px-4 py-3 sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Applies To</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-800">
                {promotion.appliesToLabels.join(', ')}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 ring-1 ring-slate-200">
              <ShoppingBag className="size-4" />
            </span>
            <h2 className="text-sm font-bold text-slate-950">Promotion Configuration</h2>
          </div>
          <PromotionFormIngredientsGate
            isLoading={isLoading}
            isError={isError}
            onRetry={refetch}
          >
            {isReady && (
              <PromotionForm
                form={promotion}
                onChange={() => {}}
                showTypeSelection={false}
                readOnly
                categoryOptions={categoryOptions}
                productOptions={productOptions}
              />
            )}
          </PromotionFormIngredientsGate>
        </section>
      </div>
    </DashboardLayout>
  )
}
