import { Loader2 } from 'lucide-react'

export default function UsersPageLoader({ label = 'Loading team members…' }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-24 text-sm font-semibold text-slate-500">
      <Loader2 className="size-4 animate-spin text-brand" />
      {label}
    </div>
  )
}
