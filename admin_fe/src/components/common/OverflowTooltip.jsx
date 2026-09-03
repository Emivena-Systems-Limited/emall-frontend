import { useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const TOOLTIP_GAP = 8
const VIEWPORT_PADDING = 8
const CARET_SIZE = 8
const SHOW_DELAY = 80

function isOverflowing(node) {
  if (!node) return false
  if (node.scrollWidth > node.clientWidth + 1) return true
  const child = node.firstElementChild
  return child ? child.scrollWidth > child.clientWidth + 1 : false
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
    14,
    Math.min(
      triggerRect.left + triggerRect.width / 2 - left,
      tooltipWidth - 14,
    ),
  )

  return { top, left, openUpward, caretLeft }
}

export default function OverflowTooltip({ text, children }) {
  const tooltipId = useId()
  const triggerRef = useRef(null)
  const tooltipRef = useRef(null)
  const showTimer = useRef(null)
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState(null)
  const label = String(text ?? '').trim()

  const show = () => {
    window.clearTimeout(showTimer.current)
    showTimer.current = window.setTimeout(() => {
      if (!label || !isOverflowing(triggerRef.current)) return
      setOpen(true)
    }, SHOW_DELAY)
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
  }, [open, label])

  useLayoutEffect(() => () => window.clearTimeout(showTimer.current), [])

  if (!label) return children

  return (
    <>
      <span
        ref={triggerRef}
        className="block min-w-0 max-w-full"
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
            className="pointer-events-none fixed z-[130] w-max max-w-[min(20rem,calc(100vw-1rem))]"
          >
            <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-white shadow-[0_18px_40px_rgba(15,23,42,0.32)]">
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[2px] bg-brand" />
              <p className="pt-0.5 text-xs font-medium leading-relaxed text-white">{label}</p>
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
