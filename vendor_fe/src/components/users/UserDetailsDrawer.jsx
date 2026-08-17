import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import UserPermissionLevelBadge from './UserPermissionLevelBadge'
import UserRoleBadge from './UserRoleBadge'
import UserStatusBadge from './UserStatusBadge'
import UserRowActions from './UserRowActions'
import { USER_ROLE_CONFIG } from '../../constants/usersPermissions'
import { formatInvitedAt, formatLastActive, getInitials, isStoreOwner } from '../../utils/usersPermissionsUtils'
import { formatPhoneDisplay } from '../../utils/profileFormUtils'
import { canEditUser } from '../../utils/authorization'

function UserAvatar({ user }) {
  const roleConfig = USER_ROLE_CONFIG[user.role] ?? USER_ROLE_CONFIG.store_manager

  if (user.profilePicture) {
    return (
      <img
        src={user.profilePicture}
        alt=""
        className="size-16 rounded-2xl object-cover ring-4 ring-white shadow-sm"
      />
    )
  }

  return (
    <span className={`flex size-16 items-center justify-center rounded-2xl text-lg font-bold ring-4 ring-white shadow-sm ${roleConfig.avatarClass}`}>
      {getInitials(user.name)}
    </span>
  )
}

export default function UserDetailsDrawer({
  open,
  user,
  onClose,
  onEditRole,
  onManagePermissions,
  onDeactivate,
  onReactivate,
  onRemove,
  onResend,
}) {
  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    globalThis.document.body.style.overflow = 'hidden'
    globalThis.window.addEventListener('keydown', handleKeyDown)

    return () => {
      globalThis.document.body.style.overflow = ''
      globalThis.window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open || !user) return null

  const roleConfig = USER_ROLE_CONFIG[user.role] ?? USER_ROLE_CONFIG.store_manager

  return createPortal(
    <>
      <div className="overlay-appear fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-details-title"
        className="slide-in-right fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl"
      >
        <div className="shrink-0 border-b border-slate-100 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">User Details</p>
              <h2 id="user-details-title" className="mt-1 text-lg font-bold text-slate-950">{user.name}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex cursor-pointer rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close user details"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
          <div className="flex items-center gap-4">
            <UserAvatar user={user} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{user.email}</p>
              <p className="mt-1 text-xs text-slate-500">{roleConfig.description}</p>
            </div>
          </div>

          <dl className="grid gap-3">
            {[
              { label: 'Role', value: <UserRoleBadge role={user.role} /> },
              { label: 'Status', value: <UserStatusBadge status={user.status} /> },
              { label: 'Phone', value: user.phone ? formatPhoneDisplay(user.phone) : '—' },
              { label: 'Permission Level', value: <UserPermissionLevelBadge summary={user.permissionLevel} /> },
              { label: 'Last Active', value: formatLastActive(user.lastActiveAt) },
              {
                label: isStoreOwner(user) ? 'Date Joined' : 'Date Invited',
                value: formatInvitedAt(user.invitedAt),
              },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="shrink-0 border-t border-slate-100 p-5">
          <UserRowActions
            user={user}
            onView={() => {}}
            onEditRole={onEditRole}
            onManagePermissions={onManagePermissions}
            onDeactivate={onDeactivate}
            onReactivate={onReactivate}
            onRemove={onRemove}
            onResend={onResend}
            align="start"
          />
        </div>
      </aside>
    </>,
    globalThis.document.body,
  )
}
