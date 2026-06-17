import { AlertCircle, X } from 'lucide-react'

export default function SignupErrorBanner({ title, errors = [], onDismiss }) {
  const messages = errors.filter(Boolean)

  return (
    <div
      role="alert"
      className="error-animate mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-500" strokeWidth={2} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-red-800">
          {title || 'Something went wrong'}
        </p>
        {messages.length === 1 ? (
          <p className="mt-0.5 text-sm text-red-700">{messages[0]}</p>
        ) : (
          <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm text-red-700">
            {messages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="cursor-pointer rounded-lg p-1 text-red-400 transition-colors hover:bg-red-100 hover:text-red-600"
          aria-label="Dismiss error"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
