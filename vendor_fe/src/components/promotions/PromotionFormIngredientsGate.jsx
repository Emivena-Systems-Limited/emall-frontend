import { RefreshCw } from 'lucide-react'
import PromotionFormLoader from './PromotionFormLoader'

export default function PromotionFormIngredientsGate({
  isLoading,
  isError,
  onRetry,
  children,
}) {
  if (isLoading) {
    return <PromotionFormLoader />
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/60 px-5 py-8 text-center">
        <p className="text-sm font-semibold text-red-800">Unable to load form data</p>
        <p className="mt-1 text-sm text-red-600">
          Products and categories are required before you can create a promotion.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-700 ring-1 ring-red-200 transition-colors hover:bg-red-50"
        >
          <RefreshCw className="size-4" />
          Try again
        </button>
      </div>
    )
  }

  return children
}
