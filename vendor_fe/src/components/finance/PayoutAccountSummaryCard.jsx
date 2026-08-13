import { ArrowRight, AlertTriangle, Building2, CreditCard, Plus, RefreshCw } from 'lucide-react'
import { formatShortDate } from '../../utils/financeUtils'

function getActiveAccount(accounts = []) {
  return accounts.find((account) => account.isActive) ?? null
}

export default function PayoutAccountSummaryCard({
  accounts = [],
  isLoading = false,
  isError = false,
  errorMessage = '',
  isFetching = false,
  onOpen,
  onRetry,
}) {
  if (isLoading) {
    return (
      <div className="animate-pulse rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-slate-100" />
            <div className="space-y-2">
              <div className="h-3.5 w-32 rounded bg-slate-100" />
              <div className="h-3 w-48 rounded bg-slate-100" />
            </div>
          </div>
          <div className="h-10 w-40 rounded-xl bg-slate-100" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white px-5 py-4 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-100">
              <AlertTriangle className="size-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900">Unable to load payout accounts</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {errorMessage || 'Something went wrong while fetching your payout details.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
            Retry
          </button>
        </div>
      </div>
    )
  }

  const activeAccount = getActiveAccount(accounts)
  const accountCount = accounts.length
  const hasAccounts = accountCount > 0

  return (
    <div className="overflow-hidden rounded-2xl border border-brand/20 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-4 border-l-4 border-brand px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-light text-brand ring-1 ring-brand/15">
            <CreditCard className="size-5" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-brand">Payout account</p>
            {activeAccount ? (
              <>
                <p className="mt-0.5 truncate text-sm font-bold text-slate-900">
                  {activeAccount.bankName}
                  <span className="ml-2 rounded-md bg-brand/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand">
                    Active
                  </span>
                </p>
                <p className="mt-1 truncate text-xs text-slate-500">
                  <span className="font-mono font-semibold tracking-wider text-slate-700">
                    {activeAccount.accountNumber}
                  </span>
                  {activeAccount.addedAt ? (
                    <>
                      <span className="mx-1.5 text-slate-300">·</span>
                      Added {formatShortDate(activeAccount.addedAt)}
                    </>
                  ) : null}
                  {accountCount > 1 ? (
                    <>
                      <span className="mx-1.5 text-slate-300">·</span>
                      {accountCount} saved
                    </>
                  ) : null}
                </p>
              </>
            ) : hasAccounts ? (
              <>
                <p className="mt-0.5 text-sm font-bold text-slate-900">No active payout account</p>
                <p className="mt-1 text-xs text-slate-500">
                  You have {accountCount} saved account{accountCount !== 1 ? 's' : ''}. Activate one to receive payouts.
                </p>
              </>
            ) : (
              <>
                <p className="mt-0.5 text-sm font-bold text-slate-900">Set up your payout account</p>
                <p className="mt-1 text-xs text-slate-500">
                  Add a bank account so weekly earnings can be deposited.
                </p>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onOpen}
          className="inline-flex w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(199,59,45,0.22)] transition-colors hover:bg-brand-hover sm:w-auto"
        >
          {!hasAccounts ? (
            <>
              <Plus className="size-4" />
              Add payout account
            </>
          ) : (
            <>
              <Building2 className="size-4" />
              Manage payout accounts
              <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
