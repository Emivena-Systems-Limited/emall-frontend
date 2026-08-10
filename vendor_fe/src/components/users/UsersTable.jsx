import { Link } from 'react-router'
import EmptyState from '../dashboard/EmptyState'
import { USER_ROLE_CONFIG, USER_TABS } from '../../constants/usersPermissions'
import { canInviteUsers } from '../../utils/authorization'
import {
  formatInvitedAt,
  formatLastActive,
  getInitials,
} from '../../utils/usersPermissionsUtils'
import UserPermissionLevelBadge from './UserPermissionLevelBadge'
import UserRoleBadge from './UserRoleBadge'
import UserRowActions from './UserRowActions'
import UserStatusBadge from './UserStatusBadge'
import UsersCatalogToolbar from './UsersCatalogToolbar'

const TABLE_HEAD_CLASS =
  'whitespace-nowrap px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400'

function UserAvatar({ user }) {
  const roleConfig = USER_ROLE_CONFIG[user.role] ?? USER_ROLE_CONFIG.store_manager

  if (user.profilePicture) {
    return (
      <img
        src={user.profilePicture}
        alt=""
        className="size-10 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
      />
    )
  }

  return (
    <span className={`flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-1 ${roleConfig.avatarClass}`}>
      {getInitials(user.name)}
    </span>
  )
}

function getEmptyState(tab, hasActiveFilters) {
  if (hasActiveFilters) {
    return {
      title: 'No users found',
      description: 'Try adjusting your search or filters.',
    }
  }

  if (tab === USER_TABS.PENDING) {
    return {
      title: 'No pending invitations',
      description: 'There are currently no outstanding team invitations.',
    }
  }

  if (tab === USER_TABS.DEACTIVATED) {
    return {
      title: 'No deactivated users',
      description: 'There are currently no deactivated team members.',
    }
  }

  return {
    title: 'No team members found',
    description: 'Add team members to help manage your store.',
    showAddUser: canInviteUsers(),
  }
}

function UserMobileCard({ user, tab, handlers }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <UserAvatar user={user} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-900">{user.name}</p>
          <p className="mt-0.5 truncate text-xs text-slate-500">{user.email}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <UserRoleBadge role={user.role} />
            <UserStatusBadge status={user.status} />
            <UserPermissionLevelBadge summary={user.permissionLevel} />
          </div>
          <p className="mt-3 text-[11px] text-slate-500">
            {tab === USER_TABS.PENDING
              ? `Invited ${formatInvitedAt(user.invitedAt)}`
              : `Last active ${formatLastActive(user.lastActiveAt)}`}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <UserRowActions user={user} {...handlers} />
      </div>
    </article>
  )
}

export default function UsersTable({
  users,
  tab,
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  onClearFilters,
  hasActiveFilters,
  ...handlers
}) {
  const empty = getEmptyState(tab, hasActiveFilters)

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="border-b border-slate-100 px-5 py-4">
        <UsersCatalogToolbar
          search={search}
          onSearchChange={onSearchChange}
          roleFilter={roleFilter}
          onRoleFilterChange={onRoleFilterChange}
          statusFilter={statusFilter}
          onStatusFilterChange={onStatusFilterChange}
          onClearFilters={onClearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      {users.length === 0 ? (
        <EmptyState
          title={empty.title}
          description={empty.description}
          action={empty.showAddUser ? (
            <Link
              to="/users/new"
              className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-hover"
            >
              Add User
            </Link>
          ) : undefined}
          compact
        />
      ) : (
        <>
          <div className="space-y-3 p-4 lg:hidden">
            {users.map((user) => (
              <UserMobileCard key={user.id} user={user} tab={tab} handlers={handlers} />
            ))}
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className={TABLE_HEAD_CLASS}>User</th>
                  <th className={TABLE_HEAD_CLASS}>Role</th>
                  <th className={TABLE_HEAD_CLASS}>Permission Level</th>
                  <th className={TABLE_HEAD_CLASS}>Status</th>
                  {tab === USER_TABS.PENDING ? (
                    <th className={TABLE_HEAD_CLASS}>Date Invited</th>
                  ) : (
                    <th className={TABLE_HEAD_CLASS}>Last Active</th>
                  )}
                  <th className={`${TABLE_HEAD_CLASS} w-36`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="text-sm text-slate-700 transition-colors hover:bg-slate-50/60">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={user} />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">{user.name}</p>
                          <p className="truncate text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <UserRoleBadge role={user.role} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <UserPermissionLevelBadge summary={user.permissionLevel} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <UserStatusBadge status={user.status} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-600">
                      {tab === USER_TABS.PENDING
                        ? formatInvitedAt(user.invitedAt)
                        : formatLastActive(user.lastActiveAt)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <UserRowActions user={user} {...handlers} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}
