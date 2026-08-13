import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { CreditCard, Plus, X } from 'lucide-react'
import PayoutAccountSection from './PayoutAccountSection'

export default function PayoutAccountsManageDrawer({
  open,
  accounts = [],
  onClose,
  onAdd,
  onReplace,
  onActivate,
  activatingAccountId = null,
  replacingAccountId = null,
}) {
  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  const hasAccounts = accounts.length > 0

  return createPortal(
    <>
      <div
        className="overlay-appear fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="payout-accounts-manage-title"
        className="slide-in-right fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 bg-slate-50/80 px-5 py-5 sm:px-6">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-brand shadow-sm ring-1 ring-brand/15">
              <CreditCard className="size-5" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                Finance
              </p>
              <h2 id="payout-accounts-manage-title" className="mt-0.5 text-lg font-bold text-slate-900">
                Payout accounts
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Only one account can be active for payouts at a time.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-xl bg-white p-2 text-slate-400 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close panel"
          >
            <X className="size-5" />
          </button>
        </div>

        {hasAccounts && (
          <div className="border-b border-slate-100 px-5 py-3 sm:px-6">
            <button
              type="button"
              onClick={onAdd}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Plus className="size-4" />
              Add another account
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <PayoutAccountSection
            embedded
            accounts={accounts}
            onAdd={onAdd}
            onReplace={onReplace}
            onActivate={onActivate}
            activatingAccountId={activatingAccountId}
            replacingAccountId={replacingAccountId}
          />
        </div>
      </aside>
    </>,
    document.body,
  )
}
