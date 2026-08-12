import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function UsersErrorState({
  title = 'Unable to load users',
  message = 'Something went wrong while loading your team members.',
  onRetry,
  isRetrying = false,
}) {
  return (
    <div className="mx-auto max-w-md space-y-5 rounded-2xl border border-slate-200 bg-white py-16 text-center">
      <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-100">
        <AlertTriangle className="size-6" />
      </span>
      <div>
        <h2 className="text-xl font-bold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm text-slate-500">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className={`size-4 ${isRetrying ? 'animate-spin' : ''}`} />
          Try Again
        </button>
      )}
    </div>
  )
}
