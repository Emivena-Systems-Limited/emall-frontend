import { ShieldCheck, UserRound } from 'lucide-react'

function VerificationBadge({ verified }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.68rem] font-bold ${
        verified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
      }`}
    >
      <ShieldCheck className="size-3.5" />
      {verified ? 'Verified' : 'Not verified'}
    </span>
  )
}

export default function AccountInformationCard({ profile, user, onDeleteProfile }) {
  const rows = [
    { label: 'Full name', value: profile.fullName },
    {
      label: 'Email address',
      value: profile.email,
      badge: (
        <VerificationBadge
          verified={Boolean(user?.email_verified_at || user?.email_verified || user?.is_email_verified)}
        />
      ),
    },
    {
      label: 'Phone number',
      value: profile.phone,
      badge: (
        <VerificationBadge
          verified={Boolean(user?.phone_verified_at || user?.phone_verified || user?.is_phone_verified)}
        />
      ),
    },
  ]

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-auth-primary">Personal details</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">Account information</h2>
        </div>
        <span className="flex size-11 items-center justify-center rounded-xl bg-red-50 text-auth-primary">
          <UserRound className="size-5" />
        </span>
      </div>

      <dl className="mt-2 divide-y divide-slate-100">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid gap-1 py-4 sm:grid-cols-[9rem_minmax(0,1fr)_auto] sm:items-center sm:gap-4"
          >
            <dt className="text-sm font-medium text-slate-500">{row.label}</dt>
            <dd className="min-w-0 break-words text-sm font-semibold text-slate-900">{row.value}</dd>
            {row.badge ? <dd>{row.badge}</dd> : <span />}
          </div>
        ))}
      </dl>

      <p className="mt-2 rounded-xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
        Email address and phone number are secured account identifiers and cannot be changed here.
      </p>
      <button
        type="button"
        onClick={onDeleteProfile}
        className="mt-4 text-xs font-bold text-red-600 underline-offset-4 hover:underline"
      >
        Delete my account
      </button>
    </section>
  )
}
