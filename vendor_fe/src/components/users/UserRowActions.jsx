import { useRef, useState } from 'react'
import {
  Eye,
  KeyRound,
  Mail,
  MoreHorizontal,
  Pencil,
  Shield,
  Trash2,
  UserCheck,
  UserX,
} from 'lucide-react'
import PortalMenu from '../common/PortalMenu'
import {
  canDeactivateUser,
  canEditUser,
  canEditUserRole,
  canManageUserPermissions,
  canReactivateUser,
  canRemoveUser,
  canResendInvitation,
} from '../../utils/authorization'

function UserMenuAction({ icon: Icon, tone, label, helper, onClick, destructive = false }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`group flex w-full cursor-pointer items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none ${
        destructive ? 'hover:bg-red-50' : ''
      }`}
    >
      <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform group-hover:scale-[1.03] ${tone}`}>
        <Icon className="size-4" strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1 pt-0.5">
        <span className={`block text-sm font-semibold ${destructive ? 'text-red-700' : 'text-slate-900'}`}>{label}</span>
        {helper && <span className="mt-0.5 block text-xs leading-snug text-slate-500">{helper}</span>}
      </span>
    </button>
  )
}

export default function UserRowActions({
  user,
  onView,
  onEditRole,
  onManagePermissions,
  onDeactivate,
  onReactivate,
  onRemove,
  onResend,
  align = 'end',
}) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)
  const close = () => setOpen(false)
  const run = (action) => {
    action()
    close()
  }

  const actions = [
    { show: true, icon: Eye, tone: 'bg-sky-50 text-sky-700 ring-sky-100', label: 'View User', helper: 'Open user details', onClick: () => onView(user) },
    { show: canEditUserRole(user), icon: Shield, tone: 'bg-violet-50 text-violet-700 ring-violet-100', label: 'Edit Role', helper: 'Change between Admin and Store Manager', onClick: () => onEditRole(user) },
    { show: canManageUserPermissions(user), icon: KeyRound, tone: 'bg-amber-50 text-amber-700 ring-amber-100', label: 'Manage Permissions', helper: 'Configure module access', onClick: () => onManagePermissions(user) },
    { show: canResendInvitation(user), icon: Mail, tone: 'bg-cyan-50 text-cyan-700 ring-cyan-100', label: 'Resend Invitation', helper: 'Send the invite again', onClick: () => onResend(user) },
    { show: canDeactivateUser(user), icon: UserX, tone: 'bg-orange-50 text-orange-700 ring-orange-100', label: 'Deactivate User', helper: 'Disable dashboard access', onClick: () => onDeactivate(user), destructive: true },
    { show: canReactivateUser(user), icon: UserCheck, tone: 'bg-emerald-50 text-emerald-700 ring-emerald-100', label: 'Reactivate User', helper: 'Restore dashboard access', onClick: () => onReactivate(user) },
    { show: canRemoveUser(user), icon: Trash2, tone: 'bg-red-50 text-red-700 ring-red-100', label: 'Remove User', helper: 'Permanently remove from team', onClick: () => onRemove(user), destructive: true },
  ].filter((action) => action.show)

  if (!canEditUser(user) && actions.length <= 1) {
    return (
      <button
        type="button"
        onClick={() => onView(user)}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
      >
        <Eye className="size-3.5" />
        View
      </button>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${align === 'end' ? 'justify-end' : 'justify-start'}`}>
      <button
        type="button"
        onClick={() => onView(user)}
        className="hidden cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 sm:inline-flex"
      >
        <Eye className="size-3.5" />
        View
      </button>

      {actions.length > 1 && (
        <>
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-haspopup="menu"
            className={`inline-flex cursor-pointer items-center justify-center rounded-lg p-2 ring-1 transition-all ${
              open
                ? 'bg-brand-light/30 text-brand ring-brand/25 shadow-sm'
                : 'text-slate-500 ring-transparent hover:bg-slate-100 hover:text-slate-800'
            }`}
            aria-label={`Actions for ${user.name}`}
          >
            <MoreHorizontal className="size-4" />
          </button>

          <PortalMenu open={open} onClose={close} triggerRef={triggerRef} menuWidth={300} className="overflow-hidden py-0">
            <div className="border-b border-slate-100 bg-linear-to-b from-slate-50 to-white px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">User actions</p>
              <p className="mt-1 truncate text-sm font-bold text-slate-950">{user.name}</p>
            </div>
            <div className="py-1.5">
              {actions.map((action) => (
                <UserMenuAction
                  key={action.label}
                  icon={action.icon}
                  tone={action.tone}
                  label={action.label}
                  helper={action.helper}
                  destructive={action.destructive}
                  onClick={() => run(action.onClick)}
                />
              ))}
            </div>
          </PortalMenu>
        </>
      )}
    </div>
  )
}
