import { AlertCircle } from 'lucide-react'

export default function FieldError({ message }) {
  if (!message) return null

  return (
    <p
      className="error-animate mt-1.5 flex items-start gap-1.5 text-xs text-red-600"
      role="alert"
    >
      <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden="true" strokeWidth={2} />
      <span>{message}</span>
    </p>
  )
}
