import { ShieldCheck, UserRound } from 'lucide-react'

function VerificationBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[0.625rem] font-bold text-emerald-700">
      <ShieldCheck className="size-3" />
      Verified
    </span>
  )
}

export default function AccountInformationCard({ profile, onDeleteProfile, className = '' }) {
  const rows = [
    { label: 'Full name', value: profile.fullName },
    {
      label: 'Email address',
      value: profile.email,
      badge: <VerificationBadge />,
    },
    {
      label: 'Phone number',
      value: profile.phone,
      badge: <VerificationBadge />,
    },
  ]

  return (
    <section
      className={`flex h-full min-h-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6 ${className}`}
    >
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 pb-3.5">
        <div>
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-auth-primary">Personal details</p>
          <h2 className="mt-1 text-sm font-bold text-slate-950 sm:text-base">Account information</h2>
        </div>
        <span className="flex size-9 items-center justify-center rounded-xl bg-red-50 text-auth-primary">
          <UserRound className="size-4" />
        </span>
      </div>

      <div className="mt-3.5 flex min-h-0 flex-1 flex-col gap-2.5">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex min-h-16 flex-1 flex-col justify-center rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-3 sm:px-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-slate-500">{row.label}</p>
                <p className="mt-1 wrap-break-word text-xs font-semibold text-slate-900 sm:text-sm">{row.value}</p>
              </div>
              {row.badge ? <div className="shrink-0">{row.badge}</div> : null}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto shrink-0 pt-3.5">
        <p className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-[0.6875rem] leading-5 text-slate-500">
          Email address and phone number are secured account identifiers and cannot be changed here.
        </p>
        <button
          type="button"
          onClick={onDeleteProfile}
          className="mt-3 text-[0.6875rem] font-bold text-red-600 underline-offset-4 hover:underline"
        >
          Delete my account
        </button>
      </div>
    </section>
  )
}
