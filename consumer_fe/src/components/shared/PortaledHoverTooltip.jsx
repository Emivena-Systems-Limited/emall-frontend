import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export default function PortaledHoverTooltip({ content, children }) {
  const triggerRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const tooltipId = useId()

  const updateCoords = useCallback(() => {
    const trigger = triggerRef.current
    if (!trigger) return

    const rect = trigger.getBoundingClientRect()
    setCoords({
      top: rect.top - 8,
      left: rect.right,
    })
  }, [])

  const show = useCallback(() => {
    if (!content) return
    updateCoords()
    setVisible(true)
  }, [content, updateCoords])

  const hide = useCallback(() => {
    setVisible(false)
  }, [])

  useEffect(() => {
    if (!visible) return undefined

    updateCoords()
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
              id={tooltipId}
              role="tooltip"
              style={{
                position: 'fixed',
                top: coords.top,
                left: coords.left,
                transform: 'translate(-100%, -100%)',
                zIndex: 9999,
              }}
              className="pointer-events-none max-w-[min(18rem,calc(100vw-1.5rem))] whitespace-normal rounded-md bg-slate-900 px-2 py-1 text-center text-[0.6875rem] font-semibold leading-snug text-white shadow-lg"
            >
              {content}
            </span>,
            document.body,
          )
        : null}
    </>
  )
}
