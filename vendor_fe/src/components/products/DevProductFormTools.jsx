import { useState } from 'react'
import { Bug, ChevronDown, ChevronUp } from 'lucide-react'
import {
  DEV_PRODUCT_FILLABLE_STEPS,
  getDevProductCatalogFillWarnings,
  getDevProductMergedFixtures,
  getDevProductStepFixture,
} from '../../utils/devProductFormFixtures'
import notify from '../../lib/notify'
import { isLocalEnvironment } from '../../utils/environment'

export default function DevProductFormTools({
  activeStep,
  stepTitle,
  catalogContext,
  onFillStep,
  onFillAll,
}) {
  const [open, setOpen] = useState(true)

  if (!isLocalEnvironment()) return null

  const notifyCatalogWarnings = (stepIndex) => {
    if (stepIndex !== 0) return
    getDevProductCatalogFillWarnings(catalogContext).forEach((message) => {
      notify.info(message)
    })
  }

  const handleFillStep = (stepIndex) => {
    const fixture = getDevProductStepFixture(stepIndex, catalogContext)
    if (!fixture) {
      if (stepIndex === 1) {
        notify.info('Images are not auto-filled — upload manually.')
        return
      }
      notify.info('No dev data for this step.')
      return
    }
    onFillStep(fixture, stepIndex)
    notifyCatalogWarnings(stepIndex)
    const label = DEV_PRODUCT_FILLABLE_STEPS.find((s) => s.index === stepIndex)?.label ?? stepTitle
    if (stepIndex === 3) {
      notify.success(`Dev data loaded: ${label}. Add variant photos manually before publishing.`)
      return
    }
    notify.success(`Dev data loaded: ${label}`)
  }

  const handleFillCurrent = () => {
    if (activeStep === 1) {
      notify.info('Images are not auto-filled — upload manually.')
      return
    }
    const fixture = getDevProductStepFixture(activeStep, catalogContext)
    if (!fixture) {
      notify.info('No dev data for this step.')
      return
    }
    onFillStep(fixture, activeStep)
    notifyCatalogWarnings(activeStep)
    if (activeStep === 3) {
      notify.success(`Dev data loaded for ${stepTitle}. Add variant photos manually before publishing.`)
      return
    }
    notify.success(`Dev data loaded for ${stepTitle}`)
  }

  const handleFillAll = () => {
    onFillAll(getDevProductMergedFixtures(catalogContext))
    notifyCatalogWarnings(0)
    notify.success('Dev data loaded for all steps except product and variant images.')
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
            Pre-fill form steps for testing. Product and variant images must still be uploaded manually.
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
