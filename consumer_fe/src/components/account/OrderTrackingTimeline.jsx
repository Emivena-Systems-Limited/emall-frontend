import { motion } from 'framer-motion'
import {
  Bike,
  Check,
  ClipboardList,
  Package,
  RefreshCw,
  XCircle,
} from 'lucide-react'
import { buildOrderTrackingSteps } from '../../utils/normalizeOrders'

const stepIcons = {
  placed: ClipboardList,
  processing: RefreshCw,
  shipped: Bike,
  delivered: Check,
}

const STATUS_ICON_PX = 40
const STATUS_ICON_HALF = STATUS_ICON_PX / 2

function stepCircleClass(step, isStatus) {
  if (step.partial) {
    return isStatus
      ? 'bg-amber-500 text-white ring-4 ring-amber-200/80'
      : 'bg-amber-500 text-white'
  }

  if (!isStatus) {
    return step.reached
      ? 'bg-auth-primary text-white'
      : 'bg-slate-100 text-slate-400'
  }

  if (step.reached) {
    return `bg-auth-primary text-white${step.active ? ' ring-4 ring-auth-primary/20' : ''}`
  }

  return 'bg-slate-100 text-slate-400'
}

export default function OrderTrackingTimeline({
  record,
  className = '',
  variant = 'card',
  compact = false,
}) {
  const tracking = buildOrderTrackingSteps(record, { compact })
  const isStatus = variant === 'status'
  const segments = Math.max(1, tracking.steps.length - 1)
  const reachedIndex = tracking.steps.findLastIndex((step) => step.reached)
  const filledSegments = Math.max(0, reachedIndex)
  const progressScale = filledSegments / segments
  const iconSize = isStatus ? 'size-10' : 'size-10 sm:size-12'

  if (tracking.cancelled) {
    return (
      <section
        id="order-tracking"
        className={`w-full ${
          isStatus ? '' : 'rounded-2xl border border-red-200 bg-linear-to-br from-red-50 to-white p-5 sm:p-6'
        } ${className}`}
      >
        <div className="flex items-start gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
            <XCircle className="size-4" strokeWidth={1.8} aria-hidden />
          </span>
          <div>
            <h3 className={`${isStatus ? 'text-base font-bold' : 'text-lg font-bold'} text-slate-950`}>
              Order Status
            </h3>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              This order was cancelled and is no longer being fulfilled.
            </p>
          </div>
        </div>
      </section>
    )
  }

  const trackInset = isStatus ? `${STATUS_ICON_HALF}px` : '1.5rem'
  const lineTop = isStatus ? `${STATUS_ICON_HALF}px` : undefined

  return (
    <section id="order-tracking" className={`w-full ${className}`}>
      <h3 className={`${isStatus ? 'text-base font-bold text-slate-950' : 'text-lg font-bold text-slate-950'}`}>
        Order Status
      </h3>
      {tracking.summary ? (
        <p className={`${isStatus ? 'mt-1 text-xs' : 'mt-1 text-sm'} font-medium text-slate-600`}>
          {tracking.summary}
        </p>
      ) : !isStatus ? (
        <p className="mt-1 text-sm text-slate-500">Follow your order from placement to delivery.</p>
      ) : null}

      <div className={`${isStatus ? 'mt-4' : 'mt-6'} w-full overflow-x-clip`}>
        <div className="relative w-full">
          <div
            className={`pointer-events-none absolute h-px -translate-y-1/2 bg-slate-200 ${
              isStatus ? '' : 'top-6 sm:top-6 left-6 right-6 sm:left-6 sm:right-6'
            }`}
            style={
              isStatus
                ? { top: lineTop, left: trackInset, right: trackInset }
                : undefined
            }
            aria-hidden
          />
          <motion.div
            className={`pointer-events-none absolute h-px -translate-y-1/2 bg-auth-primary ${
              isStatus ? '' : 'top-6 sm:top-6 left-6 sm:left-6'
            }`}
            style={
              isStatus
                ? { top: lineTop, left: trackInset, transformOrigin: 'left center' }
                : undefined
            }
            initial={{ width: 0 }}
            animate={{
              width: isStatus
                ? `calc((100% - ${STATUS_ICON_PX}px) * ${progressScale})`
                : `calc((100% - 3rem) * ${progressScale})`,
            }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            aria-hidden
          />

          <div className="relative flex w-full items-start justify-between">
            {tracking.steps.map((step, index) => {
              const Icon = stepIcons[step.key] ?? Package
              const isFirst = index === 0
              const isLast = index === tracking.steps.length - 1
              const edgeAlignClass = isStatus
                ? isFirst
                  ? 'items-start text-left'
                  : isLast
                    ? 'items-end text-right'
                    : 'items-center text-center'
                : 'items-center text-center'

              return (
                <motion.div
                  key={step.key}
                  className={`relative z-10 flex flex-col gap-2 ${edgeAlignClass} ${
                    isStatus ? 'min-w-0 flex-1' : 'max-w-20'
                  }`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.07, ease: 'easeOut' }}
                >
                  <motion.span
                    className={`flex shrink-0 items-center justify-center rounded-full ${iconSize} ${stepCircleClass(step, isStatus)}`}
                    animate={
                      step.active
                        ? {
                            scale: [1, 1.06, 1],
                            boxShadow: [
                              '0 0 0 0 rgba(192, 57, 43, 0.35)',
                              '0 0 0 10px rgba(192, 57, 43, 0)',
                              '0 0 0 0 rgba(192, 57, 43, 0)',
                            ],
                          }
                        : { scale: 1 }
                    }
                    transition={
                      step.active
                        ? { duration: 2, repeat: Infinity, ease: 'easeOut' }
                        : { duration: 0.3 }
                    }
                  >
                    <Icon className={isStatus ? 'size-4.5' : 'size-4 sm:size-5'} strokeWidth={2} aria-hidden />
                  </motion.span>
                  <p
                    className={`w-full leading-tight ${
                      isStatus ? 'whitespace-nowrap text-[0.6875rem] sm:text-xs' : 'text-xs'
                    } ${
                      step.reached || step.active ? 'font-medium text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
