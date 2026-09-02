import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Hash } from 'lucide-react'

const TOOLTIP_GAP = 10
const VIEWPORT_PADDING = 8
const CARET_SIZE = 8

function truncateOrderId(value, head = 8, tail = 4) {
  const raw = String(value ?? '').trim()
  if (!raw || raw === '—') return raw || '—'
  if (raw.length <= head + tail + 1) return raw
  return `${raw.slice(0, head)}…${raw.slice(-tail)}`
}

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
    16,
    Math.min(
      triggerRect.left + triggerRect.width / 2 - left,
      tooltipWidth - 16,
    ),
  )

  return { top, left, openUpward, caretLeft }
}

export default function OrderIdTooltip({ value, highlight = false }) {
  const triggerRef = useRef(null)
  const tooltipRef = useRef(null)
  const hideTimer = useRef(null)
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState(null)

  const full = String(value ?? '').trim() || '—'
  const truncated = truncateOrderId(full)

  const show = () => {
    window.clearTimeout(hideTimer.current)
    if (full && full !== '—') setOpen(true)
  }

  const hide = () => {
    hideTimer.current = window.setTimeout(() => setOpen(false), 100)
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
  }, [open, full])

  useLayoutEffect(() => () => window.clearTimeout(hideTimer.current), [])

  if (!full || full === '—') {
    return <span className="text-slate-400">—</span>
  }

  return (
    <span className="inline-flex max-w-full items-center gap-1.5">
      <button
        ref={triggerRef}
        type="button"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        aria-label={highlight ? `New order ID ${full}` : `Order ID ${full}`}
        className={`inline-flex max-w-full cursor-pointer items-center rounded-md px-1 py-0.5 font-mono text-sm tracking-wide underline decoration-dotted underline-offset-4 transition-colors focus-visible:outline-none ${
          highlight
            ? 'bg-brand-light/80 font-bold text-brand decoration-brand/40 hover:bg-brand-light focus-visible:bg-brand-light'
            : 'font-semibold text-slate-900 decoration-slate-300 hover:bg-slate-50 hover:text-brand hover:decoration-brand/40 focus-visible:bg-slate-50'
        }`}
      >
        {truncated}
      </button>
      {highlight ? (
        <span className="inline-flex shrink-0 items-center rounded-full bg-brand px-1.5 py-px text-[9px] font-bold uppercase tracking-[0.12em] text-white">
          New
        </span>
      ) : null}

      {open
        ? createPortal(
          <div
            ref={tooltipRef}
            role="tooltip"
            onMouseEnter={show}
            onMouseLeave={hide}
            style={{
              top: position?.top ?? -9999,
              left: position?.left ?? -9999,
              visibility: position ? 'visible' : 'hidden',
            }}
            className="pointer-events-auto fixed z-[130] min-w-[16rem] max-w-[min(24rem,calc(100vw-1rem))]"
          >
            <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-3 text-white shadow-[0_18px_40px_rgba(15,23,42,0.32)]">
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-brand ring-1 ring-white/10">
                  <Hash className="size-3.5" strokeWidth={2.25} />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Order ID
                  </p>
                  <p className="mt-1 break-all font-mono text-xs font-semibold leading-relaxed tracking-wide text-white">
                    {full}
                  </p>
                </div>
              </div>
            </div>

            <span
              aria-hidden
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
    </span>
  )
}
