import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const MENU_GAP = 6
const VIEWPORT_PADDING = 8

function getMenuPosition(triggerRect, menuRect) {
  const viewportHeight = window.innerHeight
  const viewportWidth = window.innerWidth
  const menuHeight = menuRect.height
  const menuWidth = menuRect.width

  const spaceBelow = viewportHeight - triggerRect.bottom - VIEWPORT_PADDING
  const spaceAbove = triggerRect.top - VIEWPORT_PADDING
  const openUpward = spaceBelow < menuHeight + MENU_GAP && spaceAbove > spaceBelow

  let top = openUpward
    ? triggerRect.top - menuHeight - MENU_GAP
    : triggerRect.bottom + MENU_GAP

  top = Math.max(
    VIEWPORT_PADDING,
    Math.min(top, viewportHeight - menuHeight - VIEWPORT_PADDING),
  )

  let left = triggerRect.right - menuWidth
  left = Math.max(
    VIEWPORT_PADDING,
    Math.min(left, viewportWidth - menuWidth - VIEWPORT_PADDING),
  )

  return { top, left, openUpward }
}

export default function PortalMenu({
  open,
  onClose,
  triggerRef,
  children,
  className = '',
  menuWidth = 160,
}) {
  const menuRef = useRef(null)
  const [position, setPosition] = useState(null)

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null)
      return undefined
    }

    const updatePosition = () => {
      const trigger = triggerRef.current
      const menu = menuRef.current
      if (!trigger || !menu) return

      setPosition(getMenuPosition(trigger.getBoundingClientRect(), menu.getBoundingClientRect()))
    }

    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)

    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [open, triggerRef, menuWidth])

  useEffect(() => {
    if (!open) return undefined

    const handlePointerDown = (event) => {
      if (
        triggerRef.current?.contains(event.target)
        || menuRef.current?.contains(event.target)
      ) {
        return
      }

      onClose()
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open, onClose, triggerRef])

  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      style={{
        top: position?.top ?? -9999,
        left: position?.left ?? -9999,
        width: menuWidth,
        visibility: position ? 'visible' : 'hidden',
      }}
      className={`fixed z-[100] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl ${className}`}
    >
      {children}
    </div>,
    document.body,
  )
}
