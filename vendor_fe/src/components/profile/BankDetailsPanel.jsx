import { AlertTriangle, CreditCard, Plus, RefreshCw } from 'lucide-react'
import PayoutAccountSection from '../finance/PayoutAccountSection'
import ProfileSectionCard from './ProfileSectionCard'

export default function BankDetailsPanel({
  accounts = [],
  isLoading = false,
  isError = false,
  errorMessage = '',
  isFetching = false,
  onRetry,
  onAdd,
  onReplace,
  onActivate,
  activatingAccountId = null,
  replacingAccountId = null,
}) {
  const hasAccounts = accounts.length > 0

  return (
    <ProfileSectionCard
      icon={CreditCard}
      title="Bank Details"
      subtitle="Payout accounts used for vendor settlements. Only one account can be active at a time."
      action={hasAccounts && !isLoading && !isError ? (
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          <Plus className="size-4" />
          Add account
        </button>
      ) : null}
    >
      {isLoading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-28 rounded-xl bg-slate-100" />
          <div className="h-16 rounded-xl bg-slate-100" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50/40 px-6 py-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-white text-red-500 ring-1 ring-red-100">
            <AlertTriangle className="size-5" />
          </span>
          <p className="mt-4 text-sm font-semibold text-slate-800">Unable to load bank details</p>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            {errorMessage || 'Something went wrong while fetching your payout accounts.'}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
            Retry
          </button>
        </div>
      ) : (
        <PayoutAccountSection
          embedded
          accounts={accounts}
          onAdd={onAdd}
          onReplace={onReplace}
          onActivate={onActivate}
          activatingAccountId={activatingAccountId}
          replacingAccountId={replacingAccountId}
        />
      )}
    </ProfileSectionCard>
  )
}
