import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'

export default function AuthHomeLink({ className = 'mt-4 sm:mt-5' }) {
  return (
    <div className={`text-center ${className}`}>
      <Link
        to="/"
        className="inline-flex cursor-pointer items-center justify-center gap-1.5 text-sm font-semibold text-auth-accent underline-offset-2 transition-colors hover:text-auth-primary hover:underline"
      >
        <ArrowLeft className="size-3.5" strokeWidth={2.25} aria-hidden="true" />
        Back to home
      </Link>
    </div>
  )
}
