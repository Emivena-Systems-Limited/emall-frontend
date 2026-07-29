import { useState } from 'react'
import { LogOut } from 'lucide-react'

export default function DeleteProfileModal({ isDeleting, onClose, onConfirm }) {
  const [confirmation, setConfirmation] = useState('')

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Delete profile"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <LogOut className="size-5" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-950">Delete your account?</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          This action is permanent. Type <strong>DELETE</strong> to confirm.
        </p>
        <input
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          className="mt-4 h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-red-500"
          placeholder="Type DELETE"
        />
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmation !== 'DELETE' || isDeleting}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40"
          >
            {isDeleting ? 'Deleting…' : 'Delete account'}
          </button>
        </div>
      </div>
    </div>
  )
}
