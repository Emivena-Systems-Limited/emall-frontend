import { useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const TOOLTIP_GAP = 8
const VIEWPORT_PADDING = 8
const CARET_SIZE = 8
const SHOW_DELAY = 80

function getTooltipPosition(triggerRect, tooltipRect) {
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const tooltipWidth = tooltipRect.width
  const tooltipHeight = tooltipRect.height

  const spaceAbove = triggerRect.top - VIEWPORT_PADDING
  const spaceBelow = viewportHeight - triggerRect.bottom - VIEWPORT_PADDING
  const openUpward = spaceAbove >= tooltipHeight + TOOLTIP_GAP || spaceAbove > spaceBelow

  let left = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2
  left = Math.max(
    VIEWPORT_PADDING,
    Math.min(left, viewportWidth - tooltipWidth - VIEWPORT_PADDING),
  )

  const top = openUpward
    ? triggerRect.top - tooltipHeight - TOOLTIP_GAP
    : triggerRect.bottom + TOOLTIP_GAP

  const caretLeft = Math.max(
    14,
    Math.min(
      triggerRect.left + triggerRect.width / 2 - left,
      tooltipWidth - 14,
    ),
  )

  return { top, left, openUpward, caretLeft }
}

const TONE_WELL = {
  default: 'bg-white/10 text-white ring-white/10',
  brand: 'bg-brand/20 text-brand ring-brand/25',
  danger: 'bg-rose-500/15 text-rose-300 ring-rose-400/20',
}

export default function ActionTooltip({
  label,
  hint,
  icon: Icon,
  tone = 'default',
  children,
}) {
  const tooltipId = useId()
  const triggerRef = useRef(null)
  const tooltipRef = useRef(null)
  const showTimer = useRef(null)
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState(null)
  const well = TONE_WELL[tone] ?? TONE_WELL.default

  const show = () => {
    window.clearTimeout(showTimer.current)
    showTimer.current = window.setTimeout(() => setOpen(true), SHOW_DELAY)
  }

  const hide = () => {
    window.clearTimeout(showTimer.current)
    setOpen(false)
  }

  useLayoutEffect(() => {
    if (!open) return undefined

    const update = () => {
      const trigger = triggerRef.current
      const tooltip = tooltipRef.current
      if (!trigger || !tooltip) return
      setPosition(getTooltipPosition(trigger.getBoundingClientRect(), tooltip.getBoundingClientRect()))
    }

    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)

    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [open, label, hint])

  useLayoutEffect(() => () => window.clearTimeout(showTimer.current), [])

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-flex"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocusCapture={show}
        onBlurCapture={hide}
      >
        {children}
      </span>

      {open
        ? createPortal(
          <div
            ref={tooltipRef}
            id={tooltipId}
            role="tooltip"
            style={{
              top: position?.top ?? -9999,
              left: position?.left ?? -9999,
              visibility: position ? 'visible' : 'hidden',
            }}
            className="pointer-events-none fixed z-[130] w-max max-w-[min(16rem,calc(100vw-1rem))]"
          >
            <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-white shadow-[0_18px_40px_rgba(15,23,42,0.32)]">
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[2px] bg-brand" />
              <div className="flex items-start gap-2.5 pt-0.5">
                {Icon ? (
                  <span className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg ring-1 ${well}`}>
                    <Icon className="size-3.5" strokeWidth={2.25} aria-hidden="true" />
                  </span>
                ) : null}
                <div className="min-w-0">
                  <p className="text-xs font-bold leading-snug text-white">{label}</p>
                  {hint ? (
                    <p className="mt-0.5 text-[11px] font-medium leading-snug text-slate-400">{hint}</p>
                  ) : null}
                </div>
              </div>
            </div>
            <span
              aria-hidden="true"
              className="absolute size-2 rotate-45 bg-slate-950"
              style={{
                left: position?.caretLeft ?? 24,
                marginLeft: -(CARET_SIZE / 2),
                ...(position?.openUpward
                  ? { top: '100%', marginTop: -CARET_SIZE / 2 }
                  : { bottom: '100%', marginBottom: -CARET_SIZE / 2 }),
              }}
            />
          </div>,
          document.body,
        )
        : null}
    </>
  )
}
