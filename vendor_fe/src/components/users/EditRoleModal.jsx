import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, Shield, X } from 'lucide-react'
import { ASSIGNABLE_ROLES, USER_ROLE_CONFIG } from '../../constants/usersPermissions'
import UserRoleBadge from './UserRoleBadge'

export default function EditRoleModal({ open, user, onClose, onSubmit, isSubmitting = false }) {
  const [role, setRole] = useState(user?.role ?? ASSIGNABLE_ROLES[0])

  useEffect(() => {
    if (open && user) {
      const nextRole = ASSIGNABLE_ROLES.find((roleKey) => roleKey !== user.role) ?? ASSIGNABLE_ROLES[0]
      setRole(nextRole)
    }
  }, [open, user])

  useEffect(() => {
    if (!open) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isSubmitting) onClose()
    }
    globalThis.document.body.style.overflow = 'hidden'
    globalThis.window.addEventListener('keydown', handleKeyDown)
    return () => {
      globalThis.document.body.style.overflow = ''
      globalThis.window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, isSubmitting, onClose])

  if (!open || !user) return null

  const assignableRoles = ASSIGNABLE_ROLES.filter((roleKey) => roleKey !== user.role)

  return createPortal(
    <>
      <div className="overlay-appear fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm" onClick={isSubmitting ? undefined : onClose} aria-hidden="true" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                <Shield className="size-4" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-950">Edit Role</h2>
                <p className="text-xs text-slate-500">{user.name}</p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="cursor-pointer rounded-lg p-2 text-slate-400 hover:bg-slate-100">
              <X className="size-5" />
            </button>
          </div>

          <div className="space-y-4 px-5 py-5">
            <div>
              <p className="text-xs font-semibold text-slate-500">Current Role</p>
              <div className="mt-2"><UserRoleBadge role={user.role} /></div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold text-slate-600">New Role</p>
              <div className="space-y-2">
                {assignableRoles.map((roleKey) => {
                  const roleInfo = USER_ROLE_CONFIG[roleKey]
                  return (
                    <label
                      key={roleKey}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 ${
                        role === roleKey ? 'border-brand bg-brand-light/30' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="new-role"
                        checked={role === roleKey}
                        onChange={() => setRole(roleKey)}
                        className="mt-1 accent-brand"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{roleInfo.label}</p>
                        <p className="text-xs text-slate-500">{roleInfo.description}</p>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 px-5 py-4">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => onSubmit(user, role)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isSubmitting ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </>,
    globalThis.document.body,
  )
}
