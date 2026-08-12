import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { KeyRound, Loader2, X } from 'lucide-react'
import ConfirmModal from '../common/ConfirmModal'
import { isPlainObjectEqual, getDefaultPermissionsForRole } from '../../utils/usersPermissionsUtils'
import PermissionMatrix from './PermissionMatrix'
import UserRoleBadge from './UserRoleBadge'

export default function UserPermissionsDrawer({
  open,
  user,
  onClose,
  onSubmit,
  isSubmitting = false,
}) {
  const [permissions, setPermissions] = useState(user?.permissions ?? {})
  const [discardOpen, setDiscardOpen] = useState(false)

  useEffect(() => {
    if (open && user) setPermissions(user.permissions ?? {})
  }, [open, user])

  useEffect(() => {
    if (!open) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isSubmitting) handleCloseAttempt()
    }
    globalThis.document.body.style.overflow = 'hidden'
    globalThis.window.addEventListener('keydown', handleKeyDown)
    return () => {
      globalThis.document.body.style.overflow = ''
      globalThis.window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, isSubmitting, permissions, user])

  if (!open || !user) return null

  const isDirty = !isPlainObjectEqual(permissions, user.permissions ?? {})

  const handleCloseAttempt = () => {
    if (isDirty) {
      setDiscardOpen(true)
      return
    }
    onClose()
  }

  return createPortal(
    <>
      <div className="overlay-appear fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm" onClick={handleCloseAttempt} aria-hidden="true" />
      <aside className="slide-in-right fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-white shadow-2xl">
        <div className="shrink-0 border-b border-slate-100 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <KeyRound className="size-4" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-950">Manage Permissions</h2>
                <p className="text-xs text-slate-500">{user.name}</p>
              </div>
            </div>
            <button type="button" onClick={handleCloseAttempt} className="cursor-pointer rounded-lg p-2 text-slate-400 hover:bg-slate-100">
              <X className="size-5" />
            </button>
          </div>
          <div className="mt-3"><UserRoleBadge role={user.role} /></div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <PermissionMatrix
            permissions={permissions}
            onChange={(moduleKey, value) => setPermissions((current) => ({ ...current, [moduleKey]: value }))}
            roleDefaults={getDefaultPermissionsForRole(user.role)}
            onResetToDefaults={() => setPermissions(getDefaultPermissionsForRole(user.role))}
          />
        </div>

        <div className="shrink-0 flex flex-col-reverse gap-3 border-t border-slate-100 p-5 sm:flex-row sm:justify-end">
          <button type="button" onClick={handleCloseAttempt} disabled={isSubmitting} className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting || !isDirty}
            onClick={() => onSubmit(user, permissions)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isSubmitting ? 'Saving…' : 'Save Permissions'}
          </button>
        </div>
      </aside>

      <ConfirmModal
        open={discardOpen}
        title="Unsaved changes"
        description="You have unsaved permission changes."
        confirmLabel="Discard Changes"
        cancelLabel="Keep Editing"
        tone="danger"
        onConfirm={() => {
          setDiscardOpen(false)
          onClose()
        }}
        onClose={() => setDiscardOpen(false)}
      />
    </>,
    globalThis.document.body,
  )
}
