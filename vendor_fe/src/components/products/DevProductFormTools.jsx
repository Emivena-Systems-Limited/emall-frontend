import { useState } from 'react'
import { Bug, ChevronDown, ChevronUp } from 'lucide-react'
import {
  DEV_PRODUCT_FILLABLE_STEPS,
  getDevProductMergedFixtures,
  getDevProductStepFixture,
} from '../../utils/devProductFormFixtures'
import notify from '../../lib/notify'
import { isLocalEnvironment } from '../../utils/environment'

export default function DevProductFormTools({
  activeStep,
  stepTitle,
  onFillStep,
  onFillAll,
}) {
  const [open, setOpen] = useState(true)

  if (!isLocalEnvironment()) return null

  const handleFillStep = (stepIndex) => {
    const fixture = getDevProductStepFixture(stepIndex)
    if (!fixture) {
      notify.info(stepIndex === 1 ? 'Images are not auto-filled — upload manually.' : 'No dev data for this step.')
      return
    }
    onFillStep(fixture, stepIndex)
    notify.success(`Dev data loaded: ${DEV_PRODUCT_FILLABLE_STEPS.find((s) => s.index === stepIndex)?.label ?? stepTitle}`)
  }

  const handleFillCurrent = () => {
    if (activeStep === 1) {
      notify.info('Images are not auto-filled — upload manually.')
      return
    }
    const fixture = getDevProductStepFixture(activeStep)
    if (!fixture) {
      notify.info('No dev data for this step.')
      return
    }
    onFillStep(fixture, activeStep)
    notify.success(`Dev data loaded for ${stepTitle}`)
  }

  const handleFillAll = () => {
    onFillAll(getDevProductMergedFixtures())
    notify.success('Dev data loaded for all steps except images.')
  }

  return (
    <aside className="fixed bottom-4 right-4 z-50 w-72 overflow-hidden rounded-2xl border-2 border-dashed border-amber-400 bg-amber-50 shadow-xl">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full cursor-pointer items-center justify-between gap-2 bg-amber-100 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-amber-900">
          <Bug className="size-4" />
          Dev form tools
        </span>
        {open ? <ChevronDown className="size-4 text-amber-800" /> : <ChevronUp className="size-4 text-amber-800" />}
      </button>

      {open && (
        <div className="space-y-3 p-3">
          <p className="text-[11px] leading-relaxed text-amber-900/80">
            Pre-fill form steps for testing. Images are excluded — upload those manually.
          </p>

          <button
            type="button"
            onClick={handleFillCurrent}
            className="w-full cursor-pointer rounded-xl bg-amber-900 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-amber-950"
          >
            Fill current step ({stepTitle})
          </button>

          <div className="grid grid-cols-2 gap-2">
            {DEV_PRODUCT_FILLABLE_STEPS.map(({ index, label }) => (
              <button
                key={index}
                type="button"
                onClick={() => handleFillStep(index)}
                className={`cursor-pointer rounded-xl border px-2 py-2 text-[11px] font-bold transition-colors ${
                  activeStep === index
                    ? 'border-amber-500 bg-amber-200 text-amber-950'
                    : 'border-amber-200 bg-white text-amber-900 hover:border-amber-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleFillAll}
            className="w-full cursor-pointer rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs font-bold text-amber-900 transition-colors hover:bg-amber-100"
          >
            Fill all steps (skip images)
          </button>
        </div>
      )}
    </aside>
  )
}
