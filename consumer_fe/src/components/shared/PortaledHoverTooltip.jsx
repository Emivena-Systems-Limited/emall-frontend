import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const VIEWPORT_PAD = 8
const TRIGGER_GAP = 8

function clampTooltipPosition(triggerRect, width, height) {
  const maxLeft = Math.max(VIEWPORT_PAD, window.innerWidth - VIEWPORT_PAD - width)
  const maxTop = Math.max(VIEWPORT_PAD, window.innerHeight - VIEWPORT_PAD - height)
  let left = triggerRect.right - width
  let top = triggerRect.top - height - TRIGGER_GAP

  left = Math.min(Math.max(left, VIEWPORT_PAD), maxLeft)
  if (top < VIEWPORT_PAD) {
    top = triggerRect.bottom + TRIGGER_GAP
  }
  top = Math.min(Math.max(top, VIEWPORT_PAD), maxTop)

  return { top, left, width }
}

export default function PortaledHoverTooltip({ content, children }) {
  const triggerRef = useRef(null)
  const tooltipRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const [coords, setCoords] = useState(null)
  const tooltipId = useId()

  const updateCoords = useCallback(() => {
    const trigger = triggerRef.current
    const tooltip = tooltipRef.current
    if (!trigger || !tooltip) return

    setCoords(clampTooltipPosition(
      trigger.getBoundingClientRect(),
      tooltip.offsetWidth,
      tooltip.offsetHeight,
    ))
  }, [])

  const show = useCallback(() => {
    if (!content) return
    setVisible(true)
  }, [content])

  const hide = useCallback(() => {
    setVisible(false)
    setCoords(null)
  }, [])

  useLayoutEffect(() => {
    if (!visible) return undefined
    updateCoords()
    return undefined
  }, [visible, content, updateCoords])

  useEffect(() => {
    if (!visible) return undefined

    window.addEventListener('scroll', updateCoords, true)
    window.addEventListener('resize', updateCoords)
    return () => {
      window.removeEventListener('scroll', updateCoords, true)
      window.removeEventListener('resize', updateCoords)
    }
  }, [visible, updateCoords])

  if (!content) {
    return children
  }

  return (
    <>
      <span
        ref={triggerRef}
        className="relative inline-flex shrink-0"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </span>
      {visible && typeof document !== 'undefined'
        ? createPortal(
            <span
              ref={tooltipRef}
              id={tooltipId}
              role="tooltip"
              style={{
                position: 'fixed',
                top: coords?.top ?? -9999,
                left: coords?.left ?? -9999,
                width: coords?.width ? `${coords.width}px` : 'max-content',
                maxWidth: 'none',
                visibility: coords ? 'visible' : 'hidden',
                whiteSpace: 'nowrap',
                textWrap: 'nowrap',
                overflow: 'visible',
                zIndex: 9999,
              }}
              className="pointer-events-none inline-block shrink-0 whitespace-nowrap text-nowrap rounded-md bg-slate-900 px-2 py-1 text-[0.6875rem] font-semibold leading-none text-white shadow-lg"
            >
              {content}
            </span>,
            document.body,
          )
        : null}
    </>
  )
}
