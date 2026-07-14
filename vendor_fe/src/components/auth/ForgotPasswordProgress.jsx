const STEPS = [
  { id: 'request', label: 'Request code' },
  { id: 'reset', label: 'New password' },
]

export default function ForgotPasswordProgress({ activeStep = 0 }) {
  return (
    <nav aria-label="Password reset progress" className="mb-6">
      <ol className="flex gap-3">
        {STEPS.map((step, index) => {
          const isComplete = index < activeStep
          const isActive = index === activeStep

          return (
            <li
              key={step.id}
              aria-current={isActive ? 'step' : undefined}
              className="flex min-w-0 flex-1 flex-col gap-2"
            >
              <div
                aria-hidden="true"
                className={`h-1 rounded-full transition-colors duration-300 ${
                  isComplete || isActive ? 'bg-brand' : 'bg-slate-200'
                }`}
              />
              <span
                className={`text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-brand'
                    : isComplete
                      ? 'text-slate-700'
                      : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
