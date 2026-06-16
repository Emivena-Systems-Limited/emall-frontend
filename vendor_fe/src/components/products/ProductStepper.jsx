import { Check } from 'lucide-react'

export default function ProductStepper({ steps, activeStep }) {
  return (
    <nav aria-label="Product listing progress" className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_14px_40px_rgba(15,23,42,0.04)]">
      <ol className="grid gap-2 md:grid-cols-5">
        {steps.map((step, index) => {
          const complete = index < activeStep
          const active = index === activeStep

          return (
            <li key={step.id}>
              <div
                className={`flex h-full items-center gap-3 rounded-xl px-3 py-3 transition-colors ${
                  active
                    ? 'bg-brand-light text-brand'
                    : complete
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-50 text-slate-500'
                }`}
              >
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-1 ${
                    active
                      ? 'bg-white ring-brand-muted'
                      : complete
                        ? 'bg-white ring-emerald-100'
                        : 'bg-white ring-slate-200'
                  }`}
                >
                  {complete ? <Check className="size-4" strokeWidth={2.5} /> : index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold">{step.title}</span>
                  <span className="block truncate text-[11px] opacity-70">{step.caption}</span>
                </span>
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
