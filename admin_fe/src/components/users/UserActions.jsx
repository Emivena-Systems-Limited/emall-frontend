import { Archive, Eye, Shield } from 'lucide-react'
import ActionTooltip from '../common/ActionTooltip'

export default function UserActions({ user, onView, onStatus, onArchive }) {
  const name = user.name || 'this user'

  return (
    <div className="flex items-center justify-end gap-1">
      <ActionTooltip
        icon={Eye}
        label="View profile"
        hint="Open contact details, addresses, and order history"
      >
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onView?.(user)
          }}
          aria-label={`View ${name}`}
          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <Eye className="size-3.5" strokeWidth={2} aria-hidden="true" />
        </button>
      </ActionTooltip>

      <ActionTooltip
        icon={Shield}
        tone="brand"
        label="Update status"
        hint="Verify, reject, or suspend this account"
      >
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onStatus?.(user)
          }}
          aria-label={`Update status for ${name}`}
          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-brand-light hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <Shield className="size-3.5" strokeWidth={2} aria-hidden="true" />
        </button>
      </ActionTooltip>

      <ActionTooltip
        icon={Archive}
        tone="danger"
        label="Archive user"
        hint="Soft-delete this account from the active roster"
      >
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onArchive?.(user)
          }}
          aria-label={`Archive ${name}`}
          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <Archive className="size-3.5" strokeWidth={2} aria-hidden="true" />
        </button>
      </ActionTooltip>
    </div>
  )
}
