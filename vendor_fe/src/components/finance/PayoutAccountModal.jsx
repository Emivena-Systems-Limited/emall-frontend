import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Loader2 } from 'lucide-react'

export function RemovePayoutAccountModal({
  open,
  account,
  intent = 'replace',
  onClose,
  onConfirm,
  isPending = false,
}) {
  const isActivate = intent === 'activate'

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

  return createPortal(
    <>
      <div
        className="overlay-appear fixed inset-0 z-[65] bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="payout-action-title"
        className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      >
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
          <h2 id="payout-action-title" className="text-lg font-bold text-slate-900">
            {isActivate ? 'Activate payout account?' : 'Replace payout account?'}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {isActivate ? (
              <>
                Make{' '}
                <span className="font-semibold text-slate-700">{account?.bankName}</span>
                {' '}({account?.accountNumber}) your active payout account. Any currently
                active account will be deactivated.
              </>
            ) : (
              <>
                This removes{' '}
                <span className="font-semibold text-slate-700">{account?.bankName}</span>
                {' '}({account?.accountNumber}), then opens the form so you can add a new
                account.
              </>
            )}
          </p>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 cursor-pointer rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isPending}
              className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {isActivate ? 'Activate account' : 'Replace account'}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  )
}
