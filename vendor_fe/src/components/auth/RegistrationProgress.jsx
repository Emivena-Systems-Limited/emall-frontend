import { Check } from 'lucide-react'
import { REGISTRATION_STEPS } from '../../constants/vendorTerms'

export default function RegistrationProgress({ activeStep = 0, completedSteps = [] }) {
  const stepCount = REGISTRATION_STEPS.length
  const progressRatio = stepCount > 1 ? activeStep / (stepCount - 1) : 0

  return (
    <nav aria-label="Registration progress" className="-mx-6 mb-8 w-auto sm:-mx-8">
      <div className="relative px-4 sm:px-6">
        <div
          aria-hidden="true"
          className="absolute top-4 left-[12.5%] right-[12.5%] h-0.5 -translate-y-1/2 rounded-full bg-slate-200"
        />
        <div
          aria-hidden="true"
          className="absolute top-4 left-[12.5%] h-0.5 -translate-y-1/2 rounded-full bg-emerald-400 transition-all duration-500 ease-out"
          style={{ width: `calc(75% * ${progressRatio})` }}
        />

        <ol className="relative grid w-full grid-cols-4">
          {REGISTRATION_STEPS.map((step, index) => {
            const isComplete = completedSteps.includes(step.id) || index < activeStep
            const isActive = index === activeStep

            return (
              <li key={step.id} className="flex flex-col items-center gap-2">
                <span
                  className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 sm:size-9 ${
                    isComplete
                      ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                      : isActive
                        ? 'bg-brand text-white shadow-sm shadow-brand/30 ring-4 ring-brand/15'
                        : 'bg-slate-100 text-slate-400 ring-4 ring-white'
                  }`}
                >
                  {isComplete ? <Check className="size-4" strokeWidth={2.5} /> : index + 1}
                </span>
                <span
                  className={`max-w-full truncate px-0.5 text-center text-[9px] font-semibold uppercase tracking-wide sm:text-[10px] ${
                    isActive ? 'text-brand' : isComplete ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </li>
            )
          })}
        </ol>

        <p className="mt-4 text-center text-xs text-slate-500 sm:hidden">
          Step {activeStep + 1} of {stepCount}:{' '}
          <span className="font-semibold text-slate-700">{REGISTRATION_STEPS[activeStep].label}</span>
        </p>
      </div>
    </nav>
  )
}
