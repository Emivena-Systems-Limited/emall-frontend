export default function AuthStepBar({ current = 1, total = 2, labels = ['Email', 'New password'] }) {
  return (
    <ol className="mb-6 flex items-center gap-2" aria-label="Password reset progress">
      {Array.from({ length: total }, (_, index) => {
        const step = index + 1
        const active = step === current
        const done = step < current

        return (
          <li key={step} className="flex min-w-0 flex-1 items-center gap-2">
            <span
              className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                active || done ? 'bg-brand text-white' : 'bg-slate-100 text-slate-400'
              }`}
            >
              {step}
            </span>
            <span className={`truncate text-xs font-semibold ${active ? 'text-slate-900' : 'text-slate-400'}`}>
              {labels[index]}
            </span>
            {step < total && (
              <span className={`h-px min-w-4 flex-1 ${done || active ? 'bg-brand/40' : 'bg-slate-200'}`} />
            )}
          </li>
        )
      })}
    </ol>
  )
}
