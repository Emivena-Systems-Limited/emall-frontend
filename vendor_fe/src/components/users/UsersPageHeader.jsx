import { UserPlus } from 'lucide-react'
import DevDataToggle from '../dev/DevDataToggle'

export default function UsersPageHeader({ summary, devDataEnabled, onDevDataChange, onInvite }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Users & Permissions</h1>
        <p className="mt-1 text-sm text-slate-500">
          Invite team members and control who can manage products, orders, and store settings.
        </p>
        {summary.total > 0 && (
          <p className="mt-2 text-xs font-semibold text-slate-500">
            {summary.active} active · {summary.pending > 0 ? `${summary.pending} pending invite` : 'no pending invites'}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <DevDataToggle
          enabled={devDataEnabled}
          onChange={onDevDataChange}
          count={summary.total}
          ariaLabel="Toggle dummy team data"
        />
        <button
          type="button"
          onClick={onInvite}
          className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(15,23,42,0.18)] transition-colors hover:bg-slate-800"
        >
          <UserPlus className="size-4" />
          Invite member
        </button>
      </div>
    </div>
  )
}
