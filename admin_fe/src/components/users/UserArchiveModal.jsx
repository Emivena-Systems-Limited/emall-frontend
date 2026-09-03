import { useEffect, useRef } from 'react'
import { Archive, Loader2, X } from 'lucide-react'
import VendorDialog, { VendorDialogFooter } from '../vendors/VendorDialog'
import UserIdentity from './UserIdentity'
import UserStatusBadge from './UserStatusBadge'
import { useArchiveUserMutation } from '../../hooks/useAdminUsers'

export default function UserArchiveModal({ open, user, onClose, onArchived }) {
  if (!open || !user) return null
  return <UserArchiveForm key={user.id} user={user} onClose={onClose} onArchived={onArchived} />
}

function UserArchiveForm({ user, onClose, onArchived }) {
  const mutation = useArchiveUserMutation()
  const busy = mutation.isPending
  const cancelRef = useRef(null)

  useEffect(() => {
    cancelRef.current?.focus()
  }, [])

  const handleClose = () => {
    if (busy) return
    onClose()
  }

  const handleConfirm = async () => {
    if (busy) return
    try {
      await mutation.mutateAsync({ userId: user.id, status: user.status })
      onArchived?.()
      onClose()
    } catch {
      // Toast is handled by the mutation.
    }
  }

  return (
    <VendorDialog open onClose={handleClose} labelledBy="user-archive-title" widthClass="max-w-md">
      <div className="relative overflow-hidden">
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-rose-600" />
        <div className="flex items-start justify-between gap-3 px-5 pt-5 sm:px-6">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-700 ring-1 ring-rose-100">
            <Archive className="size-5" strokeWidth={2} aria-hidden="true" />
          </span>
          <button
            type="button"
            onClick={handleClose}
            disabled={busy}
            className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="px-5 pt-4 sm:px-6">
          <h2 id="user-archive-title" className="text-xl font-bold tracking-tight text-slate-950">
            Archive this user?
          </h2>
          <p id="user-archive-copy" className="mt-1.5 text-sm leading-relaxed text-slate-500">
            This removes them from the active roster. The account is archived, not permanently destroyed.
          </p>
        </div>
      </div>

      <div className="space-y-3 px-5 py-4 sm:px-6" aria-describedby="user-archive-copy">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-3">
          <UserIdentity user={user} />
          <UserStatusBadge status={user.status} />
        </div>
      </div>

      <VendorDialogFooter>
        <button
          ref={cancelRef}
          type="button"
          disabled={busy}
          onClick={handleClose}
          className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Keep user
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={handleConfirm}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-rose-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          Archive user
        </button>
      </VendorDialogFooter>
    </VendorDialog>
  )
}
