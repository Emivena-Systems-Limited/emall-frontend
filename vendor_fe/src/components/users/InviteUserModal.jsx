import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { USER_ROLES } from '../../constants/usersPermissions'

export default function InviteUserModal({ open, onClose, onInvite }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('staff')

  useEffect(() => {
    if (!open) {
      setName('')
      setEmail('')
      setRole('staff')
    }
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    onInvite({ name, email, role })
    onClose()
  }

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-pointer bg-slate-900/40 backdrop-blur-[2px]" />
      <div className="relative z-10 w-full max-w-md rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-bold text-slate-900">Invite team member</h2>
          <button type="button" onClick={onClose} className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">Full name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-light"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">Email address</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@yourstore.com"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-light"
              required
            />
          </label>
          <fieldset>
            <legend className="mb-2 text-xs font-semibold text-slate-600">Role</legend>
            <div className="space-y-2">
              {Object.entries(USER_ROLES)
                .filter(([key]) => key !== 'owner')
                .map(([key, roleInfo]) => (
                  <label
                    key={key}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
                      role === key ? 'border-brand bg-brand-light/40' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={key}
                      checked={role === key}
                      onChange={() => setRole(key)}
                      className="mt-1 accent-brand"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{roleInfo.label}</p>
                      <p className="text-xs text-slate-500">{roleInfo.description}</p>
                    </div>
                  </label>
                ))}
            </div>
          </fieldset>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 cursor-pointer rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" className="flex-1 cursor-pointer rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
              Send invite
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
