import { Link } from 'react-router'
import { ArrowRight, CheckCircle2, Mail, ShieldCheck } from 'lucide-react'

export default function SignupSuccessState({ email }) {
  return (
    <div className="page-enter text-center">
      <span className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-100">
        <CheckCircle2 className="size-8 text-emerald-500" strokeWidth={1.75} />
      </span>

      <h2 className="text-2xl font-bold tracking-tight text-slate-900">Account created</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">
        Your vendor account has been created. Check your email for a 6-digit verification code
        to activate your account.
      </p>

      {email && (
        <p className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-medium text-slate-600">
          <Mail className="size-3.5 text-slate-400" />
          Code sent to {email}
        </p>
      )}

      <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-left">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" />
          <div>
            <p className="text-sm font-semibold text-slate-900">What happens next?</p>
            <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-600">
              <li>Open the verification email we sent you.</li>
              <li>Enter the 6-digit code on the next screen.</li>
              <li>After verification, access your vendor dashboard.</li>
            </ul>
          </div>
        </div>
      </div>

      <Link
        to="/verify-account"
        state={{ email }}
        className="mt-8 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-hover"
      >
        Verify account
        <ArrowRight className="size-4" />
      </Link>
    </div>
  )
}
