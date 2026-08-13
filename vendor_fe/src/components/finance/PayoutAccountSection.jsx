import { useMemo, useState } from 'react'
import {
  Building2,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  History,
  MapPin,
  Plus,
  RefreshCw,
  ShieldCheck,
  User,
} from 'lucide-react'
import { PAYOUT_ACCOUNT_STATUS } from '../../constants/finance'
import { formatShortDate } from '../../utils/financeUtils'

function sortAccountsNewestFirst(accounts = []) {
  return [...accounts].sort((a, b) => {
    const aTime = a.addedAt ? new Date(a.addedAt).getTime() : 0
    const bTime = b.addedAt ? new Date(b.addedAt).getTime() : 0
    if (bTime !== aTime) return bTime - aTime
    return String(b.id ?? '').localeCompare(String(a.id ?? ''))
  })
}

function StatusBadge({ status }) {
  const config = PAYOUT_ACCOUNT_STATUS[status] ?? PAYOUT_ACCOUNT_STATUS.verified

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${config.className}`}
    >
      <span className={`size-1.5 shrink-0 rounded-full ${config.dot}`} aria-hidden />
      {config.label}
    </span>
  )
}

function ActivePayoutCard({
  account,
  onReplace,
  isReplacing = false,
}) {
  return (
    <article className="rounded-xl border-2 border-brand/40 bg-brand-light/20 p-3.5 ring-1 ring-brand/10">
      <div className="flex flex-wrap items-center gap-2">
        <p className="break-words text-sm font-bold leading-snug text-slate-900">
          {account.bankName}
        </p>
        <span className="rounded-md bg-brand/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand">
          Active
        </span>
        <StatusBadge status={account.status ?? 'verified'} />
      </div>

      <dl className="mt-3 space-y-1.5 text-xs">
        <div className="flex items-start gap-2 text-slate-600">
          <User className="mt-0.5 size-3.5 shrink-0 text-slate-400" />
          <div className="min-w-0">
            <dt className="sr-only">Account holder</dt>
            <dd className="break-words font-medium text-slate-800">{account.accountHolderName}</dd>
          </div>
        </div>
        <div className="flex items-start gap-2 text-slate-600">
          <CreditCard className="mt-0.5 size-3.5 shrink-0 text-slate-400" />
          <div className="min-w-0">
            <dt className="sr-only">Account number</dt>
            <dd className="break-all font-mono font-semibold tracking-wider text-slate-800">
              {account.accountNumber}
            </dd>
          </div>
        </div>
        {account.branch ? (
          <div className="flex items-start gap-2 text-slate-600">
            <MapPin className="mt-0.5 size-3.5 shrink-0 text-slate-400" />
            <div className="min-w-0">
              <dt className="sr-only">Branch</dt>
              <dd className="break-words">{account.branch}</dd>
            </div>
          </div>
        ) : null}
        <div className="flex items-start gap-2 text-slate-500">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-slate-400" />
          <div className="min-w-0">
            <dt className="sr-only">Added</dt>
            <dd>Added {account.addedAt ? formatShortDate(account.addedAt) : '—'}</dd>
          </div>
        </div>
      </dl>

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={() => onReplace(account)}
          disabled={isReplacing}
          className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`size-3 ${isReplacing ? 'animate-spin' : ''}`} />
          Replace
        </button>
      </div>
    </article>
  )
}

function InactiveAccountRow({
  account,
  onActivate,
  onReplace,
  isActivating = false,
  isReplacing = false,
}) {
  const busy = isActivating || isReplacing

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-3.5">
      <div className="flex flex-wrap items-center gap-2">
        <p className="break-words text-sm font-semibold leading-snug text-slate-900">
          {account.bankName}
        </p>
        <StatusBadge status={account.status ?? 'verified'} />
      </div>

      <dl className="mt-3 space-y-1.5 text-xs">
        <div className="flex items-start gap-2 text-slate-600">
          <User className="mt-0.5 size-3.5 shrink-0 text-slate-400" />
          <div className="min-w-0">
            <dt className="sr-only">Account holder</dt>
            <dd className="break-words font-medium text-slate-800">{account.accountHolderName}</dd>
          </div>
        </div>
        <div className="flex items-start gap-2 text-slate-600">
          <CreditCard className="mt-0.5 size-3.5 shrink-0 text-slate-400" />
          <div className="min-w-0">
            <dt className="sr-only">Account number</dt>
            <dd className="break-all font-mono font-semibold tracking-wider text-slate-800">
              {account.accountNumber}
            </dd>
          </div>
        </div>
        {account.branch ? (
          <div className="flex items-start gap-2 text-slate-600">
            <MapPin className="mt-0.5 size-3.5 shrink-0 text-slate-400" />
            <div className="min-w-0">
              <dt className="sr-only">Branch</dt>
              <dd className="break-words">{account.branch}</dd>
            </div>
          </div>
        ) : null}
        <div className="flex items-start gap-2 text-slate-500">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-slate-400" />
          <div className="min-w-0">
            <dt className="sr-only">Added</dt>
            <dd>Added {account.addedAt ? formatShortDate(account.addedAt) : '—'}</dd>
          </div>
        </div>
      </dl>

      <div className="mt-3 flex flex-wrap justify-end gap-1.5">
        <button
          type="button"
          onClick={() => onActivate(account)}
          disabled={busy}
          className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-brand px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          <CheckCircle2 className={`size-3 ${isActivating ? 'animate-pulse' : ''}`} />
          {isActivating ? 'Activating…' : 'Activate'}
        </button>
        <button
          type="button"
          onClick={() => onReplace(account)}
          disabled={busy}
          className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className="size-3" />
          Replace
        </button>
      </div>
    </li>
  )
}

export default function PayoutAccountSection({
  accounts = [],
  onAdd,
  onReplace,
  onActivate,
  activatingAccountId = null,
  replacingAccountId = null,
  embedded = false,
}) {
  const [historyOpen, setHistoryOpen] = useState(false)

  const { activeAccount, inactiveAccounts } = useMemo(() => {
    const sorted = sortAccountsNewestFirst(accounts)
    const active = sorted.find((account) => account.isActive) ?? null
    const inactive = sorted.filter((account) => account.id !== active?.id)
    return { activeAccount: active, inactiveAccounts: inactive }
  }, [accounts])

  const hasAccounts = accounts.length > 0
  const hasInactive = inactiveAccounts.length > 0

  const body = (
    <>
      {!hasAccounts ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-8 text-center">
          <span className="flex size-10 items-center justify-center rounded-xl bg-white text-slate-400 ring-1 ring-slate-200">
            <Building2 className="size-5" strokeWidth={1.5} />
          </span>
          <p className="mt-3 text-sm font-semibold text-slate-800">No payout account added</p>
          <p className="mt-1 max-w-sm text-xs text-slate-500">
            Add your bank details to receive weekly payouts from your store earnings.
          </p>
          <button
            type="button"
            onClick={onAdd}
            className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
          >
            <Plus className="size-4" />
            Add Payout Account
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {activeAccount ? (
            <ActivePayoutCard
              account={activeAccount}
              onReplace={onReplace}
              isReplacing={replacingAccountId === activeAccount.id}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50/70 px-3.5 py-3">
              <p className="text-sm font-semibold text-amber-900">No active payout account</p>
              <p className="mt-0.5 text-xs text-amber-800/80">
                Activate one of your saved accounts below to start receiving payouts.
              </p>
            </div>
          )}

          {hasInactive && (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setHistoryOpen((open) => !open)}
                aria-expanded={historyOpen}
                className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-3 text-left transition-colors hover:bg-slate-50"
              >
                <History className="size-4 shrink-0 text-slate-400" />
                <span className="min-w-0 flex-1 text-sm font-semibold text-slate-700">
                  {activeAccount ? 'Other accounts' : 'Saved accounts'}
                  <span className="ml-1.5 font-medium text-slate-400">
                    ({inactiveAccounts.length})
                  </span>
                </span>
                <ChevronDown
                  className={`size-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                    historyOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <div
                className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
                  historyOpen || !activeAccount
                    ? 'grid-rows-[1fr] opacity-100'
                    : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  <ul className="space-y-2 border-t border-slate-100 bg-slate-50/50 px-3 py-3">
                    {inactiveAccounts.map((account) => (
                      <InactiveAccountRow
                        key={account.id}
                        account={account}
                        onActivate={onActivate}
                        onReplace={onReplace}
                        isActivating={activatingAccountId === account.id}
                        isReplacing={replacingAccountId === account.id}
                      />
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )

  if (embedded) {
    return body
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <CreditCard className="size-4" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Payout Account</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Only one account can be active for payouts at a time.
            </p>
          </div>
        </div>
        {hasAccounts && (
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Plus className="size-4" />
            Add account
          </button>
        )}
      </div>

      <div className="p-4 sm:p-5">{body}</div>
    </section>
  )
}
