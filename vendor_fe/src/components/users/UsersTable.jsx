import { MoreHorizontal, Search, UserMinus, UserX } from 'lucide-react'
import { useState } from 'react'
import EmptyState from '../dashboard/EmptyState'
import { EMPTY_STATE_PRESETS } from '../../constants/emptyStates'
import { USER_ROLES, USER_STATUS } from '../../constants/usersPermissions'
import {
  formatInvitedAt,
  formatLastActive,
  getInitials,
} from '../../utils/usersPermissionsUtils'
import UserRoleBadge from './UserRoleBadge'
import UserStatusBadge from './UserStatusBadge'

const TABLE_HEAD_CLASS =
  'whitespace-nowrap px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400'

function MemberActionsMenu({ member, onSuspend, onRemove, onResend }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        aria-label={`Actions for ${member.name}`}
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

function MemberAvatar({ member }) {
  const role = USER_ROLES[member.role] ?? USER_ROLES.viewer

  return (
    <span
      className={`flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-1 ${role.avatarClass}`}
    >
      {getInitials(member.name)}
    </span>
  )
}

function MemberMobileCard({ member, onSuspend, onRemove, onResend }) {
  const role = USER_ROLES[member.role] ?? USER_ROLES.viewer

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <MemberAvatar member={member} />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">{member.name}</p>
            <p className="mt-0.5 truncate text-xs text-slate-500">{member.email}</p>
            <p className="mt-1 text-[11px] leading-snug text-slate-400">{role.description}</p>
          </div>
        </div>
        <MemberActionsMenu
          member={member}
          onSuspend={onSuspend}
          onRemove={onRemove}
          onResend={onResend}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <UserRoleBadge role={member.role} />
        <UserStatusBadge status={member.status} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Last active</p>
          <p className="mt-1 font-medium text-slate-800">{formatLastActive(member.lastActive)}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Invited</p>
          <p className="mt-1 font-medium text-slate-800">{formatInvitedAt(member.invitedAt)}</p>
        </div>
      </div>
    </article>
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Team directory</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {hasActiveFilters
                ? 'Showing members that match your filters'
                : 'Everyone with access to your vendor dashboard'}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 sm:w-56 lg:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search name or email..."
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
      </div>

      {members.length === 0 ? (
        <EmptyState
          icon={EMPTY_STATE_PRESETS.teamMembersFiltered.icon}
          title={EMPTY_STATE_PRESETS.teamMembersFiltered.title}
          description={EMPTY_STATE_PRESETS.teamMembersFiltered.description}
          compact
        />
      ) : (
        <>
          <div className="space-y-3 p-4 lg:hidden">
            {members.map((member) => (
              <MemberMobileCard
                key={member.id}
                member={member}
                onSuspend={onSuspend}
                onRemove={onRemove}
                onResend={onResend}
              />
            ))}
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className={TABLE_HEAD_CLASS}>Member</th>
                  <th className={TABLE_HEAD_CLASS}>Role</th>
                  <th className={TABLE_HEAD_CLASS}>Status</th>
                  <th className={TABLE_HEAD_CLASS}>Last active</th>
                  <th className={TABLE_HEAD_CLASS}>Invited</th>
                  <th className={`${TABLE_HEAD_CLASS} w-12`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((member) => {
                  const role = USER_ROLES[member.role] ?? USER_ROLES.viewer
                  return (
                    <tr key={member.id} className="text-sm text-slate-700 transition-colors hover:bg-slate-50/60">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <MemberAvatar member={member} />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">{member.name}</p>
                            <p className="truncate text-xs text-slate-500">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="space-y-1">
                          <UserRoleBadge role={member.role} />
                          <p className="max-w-[12rem] text-[11px] leading-snug text-slate-400">{role.description}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <UserStatusBadge status={member.status} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-600">
                        {formatLastActive(member.lastActive)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-600">
                        {formatInvitedAt(member.invitedAt)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <MemberActionsMenu
                          member={member}
                          onSuspend={onSuspend}
                          onRemove={onRemove}
                          onResend={onResend}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}
