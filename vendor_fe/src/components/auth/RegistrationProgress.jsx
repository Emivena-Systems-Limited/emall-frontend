import { Check } from 'lucide-react'
import { REGISTRATION_STEPS } from '../../constants/vendorTerms'

export default function RegistrationProgress({ activeStep = 0, completedSteps = [] }) {
  return (
    <nav aria-label="Registration progress" className="mb-8">
      <ol className="flex items-center justify-between gap-1">
        {REGISTRATION_STEPS.map((step, index) => {
          const isComplete = completedSteps.includes(step.id) || index < activeStep
          const isActive = index === activeStep

          return (
            <li key={step.id} className="flex min-w-0 flex-1 items-center">
              <div className="flex min-w-0 flex-col items-center gap-2">
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                    isComplete
                      ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                      : isActive
                        ? 'bg-brand text-white shadow-sm shadow-brand/30 ring-4 ring-brand/15'
                        : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isComplete ? <Check className="size-4" strokeWidth={2.5} /> : index + 1}
                </span>
                <span
                  className={`hidden text-center text-[10px] font-semibold uppercase tracking-wide sm:block ${
                    isActive ? 'text-brand' : isComplete ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {index < REGISTRATION_STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`mx-1 mb-5 h-0.5 flex-1 rounded-full transition-colors duration-300 sm:mx-2 ${
                    isComplete ? 'bg-emerald-300' : 'bg-slate-200'
                  }`}
                />
              )}
            </li>
          )
        })}
      </ol>

      <p className="mt-3 text-center text-xs text-slate-500 sm:hidden">
        Step {activeStep + 1} of {REGISTRATION_STEPS.length}:{' '}
        <span className="font-semibold text-slate-700">{REGISTRATION_STEPS[activeStep].label}</span>
      </p>
    </nav>
  )
}
