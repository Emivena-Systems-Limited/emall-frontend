import { MoreHorizontal, Search, Shield, UserMinus, UserX } from 'lucide-react'
import { useState } from 'react'
import EmptyState from '../dashboard/EmptyState'
import { EMPTY_STATE_PRESETS } from '../../constants/emptyStates'
import { USER_ROLES, USER_STATUS } from '../../constants/usersPermissions'
import { formatLastActive, getInitials } from '../../utils/usersPermissionsUtils'

const roleTone = {
  brand: 'bg-brand-light text-brand ring-brand-muted',
  violet: 'bg-violet-50 text-violet-700 ring-violet-100',
  sky: 'bg-sky-50 text-sky-700 ring-sky-100',
  slate: 'bg-slate-100 text-slate-600 ring-slate-200',
}

const statusTone = {
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  amber: 'bg-amber-50 text-amber-800 ring-amber-100',
  rose: 'bg-rose-50 text-rose-700 ring-rose-100',
}

function MemberActionsMenu({ member, onSuspend, onRemove, onResend }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
      >
        <MoreHorizontal className="size-4" />
      </button>
      {open && (
        <>
          <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="fixed inset-0 z-10 cursor-default" />
          <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
            {member.status === 'pending' && (
              <button type="button" onClick={() => { onResend(member); setOpen(false) }} className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50">
                Resend invite
              </button>
            )}
            {member.status === 'active' && member.role !== 'owner' && (
              <button type="button" onClick={() => { onSuspend(member); setOpen(false) }} className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-amber-700 hover:bg-amber-50">
                <UserX className="size-3.5" /> Suspend
              </button>
            )}
            {member.status === 'suspended' && (
              <button type="button" onClick={() => { onSuspend(member, 'active'); setOpen(false) }} className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-emerald-700 hover:bg-emerald-50">
                Reactivate
              </button>
            )}
            {member.role !== 'owner' && (
              <button type="button" onClick={() => { onRemove(member); setOpen(false) }} className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-rose-700 hover:bg-rose-50">
                <UserMinus className="size-3.5" /> Remove
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default function UsersTable({
  members,
  hasMembers,
  hasActiveFilters,
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  onSuspend,
  onRemove,
  onResend,
}) {
  if (!hasMembers) {
    const preset = EMPTY_STATE_PRESETS.teamMembers
    return (
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
        <EmptyState icon={preset.icon} title={preset.title} description={preset.description} />
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand-light"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => onRoleFilterChange(e.target.value)}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-light"
          >
            <option value="all">All roles</option>
            {Object.entries(USER_ROLES).map(([key, r]) => (
              <option key={key} value={key}>{r.label}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-light"
          >
            <option value="all">All statuses</option>
            {Object.entries(USER_STATUS).map(([key, s]) => (
              <option key={key} value={key}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {members.length === 0 ? (
        <EmptyState
          icon={EMPTY_STATE_PRESETS.teamMembersFiltered.icon}
          title={EMPTY_STATE_PRESETS.teamMembersFiltered.title}
          description={EMPTY_STATE_PRESETS.teamMembersFiltered.description}
          compact
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">Member</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Last active</th>
                <th className="px-5 py-3 w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((member) => {
                const role = USER_ROLES[member.role] ?? USER_ROLES.viewer
                const status = USER_STATUS[member.status] ?? USER_STATUS.active
                return (
                  <tr key={member.id} className="transition-colors hover:bg-slate-50/60">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                          {getInitials(member.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">{member.name}</p>
                          <p className="truncate text-xs text-slate-500">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ring-1 ${roleTone[role.tone]}`}>
                        {role.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ring-1 ${statusTone[status.tone]}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">{formatLastActive(member.lastActive)}</td>
                    <td className="px-5 py-3.5">
                      <MemberActionsMenu member={member} onSuspend={onSuspend} onRemove={onRemove} onResend={onResend} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export function RolePermissionsPanel() {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-violet-50 text-violet-700 ring-1 ring-violet-100">
            <Shield className="size-3.5" />
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-900">Role permissions</h2>
            <p className="text-xs text-slate-500">What each role can do in your vendor dashboard</p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(USER_ROLES).map(([key, role]) => (
          <article key={key} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <p className={`text-sm font-bold ${key === 'owner' ? 'text-brand' : 'text-slate-900'}`}>{role.label}</p>
            <p className="mt-1 text-[11px] leading-snug text-slate-500">{role.description}</p>
            <ul className="mt-3 space-y-1">
              {(key === 'owner'
                ? ['Full access to all features']
                : key === 'manager'
                  ? ['Products & inventory', 'Orders & refunds', 'Customer data', 'View earnings']
                  : key === 'staff'
                    ? ['Process orders', 'Manage inventory', 'View customers']
                    : ['View-only dashboard access']
              ).map((perm) => (
                <li key={perm} className="flex items-center gap-1.5 text-[10px] font-medium text-slate-600">
                  <span className="size-1 rounded-full bg-slate-300" />
                  {perm}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}
