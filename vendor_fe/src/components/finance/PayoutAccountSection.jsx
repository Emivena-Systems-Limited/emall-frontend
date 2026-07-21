import {
  Building2,
  CreditCard,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  User,
} from 'lucide-react'
import { PAYOUT_ACCOUNT_STATUS } from '../../constants/finance'
import { formatShortDate } from '../../utils/financeUtils'

function StatusBadge({ status }) {
  const config = PAYOUT_ACCOUNT_STATUS[status] ?? PAYOUT_ACCOUNT_STATUS.not_added

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${config.className}`}
    >
      <span className={`size-1.5 shrink-0 rounded-full ${config.dot}`} aria-hidden />
      {config.label}
    </span>
  )
}

export default function PayoutAccountSection({
  account,
  onAdd,
  onEdit,
  onRemove,
}) {
  const hasAccount = account && account.status !== 'not_added'

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="relative overflow-hidden border-b border-slate-100 bg-linear-to-br from-brand-light/50 via-white to-cyan-50/30 px-5 py-5 sm:px-6">
        <div className="absolute -right-8 -top-8 size-32 rounded-full bg-brand/5" aria-hidden />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-brand shadow-sm ring-1 ring-brand/15">
              <CreditCard className="size-5" strokeWidth={2} />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">Payout Account</h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Manage the bank account where your earnings are deposited.
              </p>
            </div>
          </div>
          <StatusBadge status={account?.status ?? 'not_added'} />
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {!hasAccount ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-white text-slate-400 ring-1 ring-slate-200">
              <Building2 className="size-6" strokeWidth={1.5} />
            </span>
            <p className="mt-4 text-sm font-semibold text-slate-800">No payout account added</p>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Add your bank details to receive weekly payouts from your store earnings.
            </p>
            <button
              type="button"
              onClick={onAdd}
              className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(199,59,45,0.22)] transition-colors hover:bg-brand-hover"
            >
              <Plus className="size-4" />
              Add Payout Account
            </button>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50/80 px-4 py-3 ring-1 ring-slate-100">
                <dt className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  <Building2 className="size-3" />
                  Bank Name
                </dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900">{account.bankName}</dd>
              </div>
              <div className="rounded-xl bg-slate-50/80 px-4 py-3 ring-1 ring-slate-100">
                <dt className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  <User className="size-3" />
                  Account Holder
                </dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900">{account.accountHolderName}</dd>
              </div>
              <div className="rounded-xl bg-slate-50/80 px-4 py-3 ring-1 ring-slate-100">
                <dt className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  <CreditCard className="size-3" />
                  Account Number
                </dt>
                <dd className="mt-1 font-mono text-sm font-semibold tracking-wider text-slate-900">
                  {account.accountNumber}
                </dd>
              </div>
              <div className="rounded-xl bg-slate-50/80 px-4 py-3 ring-1 ring-slate-100">
                <dt className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  <ShieldCheck className="size-3" />
                  Added
                </dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900">
                  {account.addedAt ? formatShortDate(account.addedAt) : '—'}
                </dd>
              </div>
            </dl>

            <div className="flex flex-wrap gap-2 lg:flex-col">
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 lg:flex-none"
              >
                <Pencil className="size-4" />
                Edit Account
              </button>
              <button
                type="button"
                onClick={onRemove}
                className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100 lg:flex-none"
              >
                <Trash2 className="size-4" />
                Remove Account
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
