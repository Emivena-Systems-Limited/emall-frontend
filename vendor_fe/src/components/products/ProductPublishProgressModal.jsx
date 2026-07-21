import { createPortal } from 'react-dom'
import { CheckCircle2, ImageUp, Loader2, PackageCheck, ShieldCheck, XCircle } from 'lucide-react'
import { PRODUCT_PUBLISH_STAGE, PRODUCT_PUBLISH_STAGE_ORDER } from '../../constants/productMediaUpload'

const STAGE_CONFIG = {
  [PRODUCT_PUBLISH_STAGE.REQUESTING_URLS]: {
    label: 'Getting your photos ready',
    description: 'Setting things up before we upload',
    icon: ShieldCheck,
  },
  [PRODUCT_PUBLISH_STAGE.UPLOADING_IMAGES]: {
    label: 'Uploading your photos',
    description: 'Adding your images to the listing',
    icon: ImageUp,
  },
  [PRODUCT_PUBLISH_STAGE.CREATING_PRODUCT]: {
    label: 'Publishing product',
    description: 'Saving your product details',
    icon: PackageCheck,
  },
  [PRODUCT_PUBLISH_STAGE.SUCCESS]: {
    label: 'Product published',
    description: "You're all set — redirecting you now",
    icon: CheckCircle2,
  },
}

function getStageStatus(stageKey, currentStage) {
  const currentIndex = PRODUCT_PUBLISH_STAGE_ORDER.indexOf(currentStage)
  const stageIndex = PRODUCT_PUBLISH_STAGE_ORDER.indexOf(stageKey)

  if (stageIndex < currentIndex) return 'done'
  if (stageIndex === currentIndex) return 'active'
  return 'pending'
}

/**
 * Full-flow progress modal shown while product media uploads and the product is saved.
 * Stages: request signed URLs → upload images to storage → create product → success.
 *
 * @param {Object} props
 * @param {boolean} props.open
 * @param {string} props.stage — one of PRODUCT_PUBLISH_STAGE
 * @param {{ completed: number, total: number } | null} [props.uploadProgress]
 * @param {string|null} [props.errorMessage] — shown when stage is 'error'
 * @param {string|null} [props.erroredAtStage] — which stage failed, for icon placement
 * @param {() => void} [props.onDismissError]
 */
export default function ProductPublishProgressModal({
  open,
  stage = PRODUCT_PUBLISH_STAGE.REQUESTING_URLS,
  uploadProgress = null,
  errorMessage = null,
  erroredAtStage = null,
  onDismissError,
}) {
  if (!open) return null

  const isError = stage === PRODUCT_PUBLISH_STAGE.ERROR
  const percent = uploadProgress?.total
    ? Math.min(100, Math.round((uploadProgress.completed / uploadProgress.total) * 100))
    : 0

  return createPortal(
    <div className="fixed inset-0 z-300 flex items-center justify-center p-4">
      <div className="overlay-appear absolute inset-0 bg-slate-900/60 backdrop-blur-sm" aria-hidden="true" />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="product-publish-progress-title"
        className="modal-appear relative z-10 w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="px-6 pt-6 pb-1">
          <h2 id="product-publish-progress-title" className="text-base font-bold text-slate-900">
            {isError ? 'We hit a snag' : 'Publishing your product'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isError
              ? (errorMessage || 'Something went wrong while publishing. Please try again.')
              : 'Hang tight — this usually takes just a few seconds.'}
          </p>
        </div>

        <div className="px-6 py-5">
          {PRODUCT_PUBLISH_STAGE_ORDER.map((stageKey, index) => {
            const config = STAGE_CONFIG[stageKey]
            const Icon = config.icon
            const isLast = index === PRODUCT_PUBLISH_STAGE_ORDER.length - 1
            const status = isError
              ? (stageKey === erroredAtStage ? 'error' : (
                PRODUCT_PUBLISH_STAGE_ORDER.indexOf(stageKey) < PRODUCT_PUBLISH_STAGE_ORDER.indexOf(erroredAtStage)
                  ? 'done'
                  : 'pending'
              ))
              : getStageStatus(stageKey, stage)

            const isUploadStage = stageKey === PRODUCT_PUBLISH_STAGE.UPLOADING_IMAGES
            const showUploadDetail = isUploadStage && status === 'active' && uploadProgress?.total > 0

            return (
              <div key={stageKey} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                      status === 'done'
                        ? 'bg-emerald-100 text-emerald-600'
                        : status === 'active'
                          ? 'bg-brand-light text-brand'
                          : status === 'error'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {status === 'done' && <CheckCircle2 className="size-4.5" strokeWidth={2} />}
                    {status === 'active' && <Loader2 className="size-4 animate-spin" strokeWidth={2.25} />}
                    {status === 'error' && <XCircle className="size-4.5" strokeWidth={2} />}
                    {status === 'pending' && <Icon className="size-4" strokeWidth={2} />}
                  </span>
                  {!isLast && (
                    <span
                      className={`mt-1 w-px flex-1 transition-colors duration-300 ${
                        status === 'done' ? 'bg-emerald-200' : 'bg-slate-200'
                      }`}
                      style={{ minHeight: '1.75rem' }}
                    />
                  )}
                </div>

                <div className={isLast ? 'pb-0.5' : 'pb-6'}>
                  <p
                    className={`text-sm font-semibold transition-colors duration-300 ${
                      status === 'pending' ? 'text-slate-400' : 'text-slate-900'
                    }`}
                  >
                    {config.label}
                  </p>
                  <p className={`mt-0.5 text-xs ${status === 'pending' ? 'text-slate-400' : 'text-slate-500'}`}>
                    {showUploadDetail
                      ? `Uploading ${uploadProgress.completed} of ${uploadProgress.total} image${uploadProgress.total === 1 ? '' : 's'}…`
                      : config.description}
                  </p>

                  {showUploadDetail && (
                    <div className="mt-2 h-1.5 w-40 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-brand transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {isError && (
          <div className="border-t border-slate-100 px-6 py-4">
            <button
              type="button"
              onClick={onDismissError}
              className="w-full cursor-pointer rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
