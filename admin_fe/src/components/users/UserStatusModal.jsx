import { useState } from 'react'
import { Ban, CheckCircle2, Clock, Loader2, Shield, XCircle } from 'lucide-react'
import { USER_STATUSES, getUserStatusMeta } from '../../constants/adminUsers'
import { useUpdateUserStatusMutation } from '../../hooks/useAdminUsers'
import VendorDialog, { VendorDialogBody, VendorDialogFooter, VendorDialogHeader } from '../vendors/VendorDialog'
import UserIdentity from './UserIdentity'
import UserStatusBadge from './UserStatusBadge'

const ICONS = {
  'check-circle': CheckCircle2,
  clock: Clock,
  ban: Ban,
  'x-circle': XCircle,
}

export default function UserStatusModal({ open, user, onClose }) {
  if (!open || !user) return null
  return <UserStatusForm key={user.id} user={user} onClose={onClose} />
}

function UserStatusForm({ user, onClose }) {
  const [selected, setSelected] = useState(user.status)
  const mutation = useUpdateUserStatusMutation()
  const busy = mutation.isPending
  const unchanged = selected === user.status
  const nextMeta = getUserStatusMeta(selected)

  const handleClose = () => {
    if (busy) return
    onClose()
  }

  const handleSave = async () => {
    if (unchanged) {
      onClose()
      return
    }

    try {
      await mutation.mutateAsync({
        userId: user.id,
        status: selected,
      })
      onClose()
    } catch {
      // Toast is handled by the mutation.
    }
  }

  return (
    <VendorDialog open onClose={handleClose} labelledBy="user-status-title" widthClass="max-w-lg">
      <VendorDialogHeader
        id="user-status-title"
        icon={Shield}
        title="Update user account"
        subtitle={`Verify, reject, or suspend ${user.name}`}
        onClose={handleClose}
      />

      <VendorDialogBody className="space-y-4 px-5 py-5 sm:px-6">
        <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3.5 py-3">
          <UserIdentity user={user} />
          <UserStatusBadge status={user.status} />
        </div>

        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="User status">
          {USER_STATUSES.map((status) => {
            const Icon = ICONS[status.icon] ?? Clock
            const active = selected === status.key
            return (
              <button
                key={status.key}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={busy}
                onClick={() => setSelected(status.key)}
                className={`flex min-h-11 min-w-0 cursor-pointer items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                  active
                    ? 'border-slate-900 bg-slate-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className={`flex size-7 shrink-0 items-center justify-center rounded-lg ring-1 ${status.badgeClass}`}>
                  <Icon className="size-3.5" strokeWidth={2.1} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-900">{status.label}</span>
                  <span className="block truncate text-[11px] text-slate-400">{status.helper}</span>
                </span>
              </button>
            )
          })}
        </div>
      </VendorDialogBody>

      <VendorDialogFooter>
        <button
          type="button"
          disabled={busy}
          onClick={handleClose}
          className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={handleSave}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {unchanged ? 'Done' : `Set to ${nextMeta.label}`}
        </button>
      </VendorDialogFooter>
    </VendorDialog>
  )
}
