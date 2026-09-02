import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router'
import { Ban, Eye, MoreHorizontal, Package, Pencil, RotateCcw } from 'lucide-react'
import VendorStatusModal from './VendorStatusModal'
import VendorSuspendModal from './VendorSuspendModal'

const MENU_GAP = 8
const VIEWPORT_PAD = 12
const ESTIMATED_MENU_WIDTH = 224
const ESTIMATED_MENU_HEIGHT = 248

function getMenuPosition(trigger, menu) {
  const rect = trigger.getBoundingClientRect()
  const menuHeight = menu?.offsetHeight || ESTIMATED_MENU_HEIGHT
  const menuWidth = menu?.offsetWidth || ESTIMATED_MENU_WIDTH
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const maxHeight = Math.max(160, viewportHeight - VIEWPORT_PAD * 2)
  const fittedHeight = Math.min(menuHeight, maxHeight)

  const spaceBelow = viewportHeight - rect.bottom - VIEWPORT_PAD
  const spaceAbove = rect.top - VIEWPORT_PAD
  const needsRoom = fittedHeight + MENU_GAP
  const dropUp = spaceBelow < needsRoom && spaceAbove > spaceBelow

  let top = dropUp
    ? rect.top - MENU_GAP - fittedHeight
    : rect.bottom + MENU_GAP

  top = Math.min(
    Math.max(top, VIEWPORT_PAD),
    viewportHeight - fittedHeight - VIEWPORT_PAD,
  )

  let left = rect.right - menuWidth
  left = Math.min(
    Math.max(left, VIEWPORT_PAD),
    viewportWidth - menuWidth - VIEWPORT_PAD,
  )

  return {
    top,
    left,
    maxHeight,
    placement: dropUp ? 'up' : 'down',
    ready: true,
  }
}

export default function VendorActionsMenu({ vendor, current = 'roster', onUpdateAccount, onSuspend }) {
  const navigate = useNavigate()
  const buttonRef = useRef(null)
  const menuRef = useRef(null)
  const menuId = useId()
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
    maxHeight: ESTIMATED_MENU_HEIGHT,
    placement: 'down',
    ready: false,
  })
  const [statusOpen, setStatusOpen] = useState(false)
  const [suspendOpen, setSuspendOpen] = useState(false)
  const ownsModals = !onUpdateAccount && !onSuspend

  const isSuspended = vendor.status === 'suspended'

  const placeMenu = () => {
    const trigger = buttonRef.current
    if (!trigger) return
    setCoords(getMenuPosition(trigger, menuRef.current))
  }

  useLayoutEffect(() => {
    if (!open) return undefined

    placeMenu()
    const frame = window.requestAnimationFrame(placeMenu)
    return () => window.cancelAnimationFrame(frame)
  }, [open])

  useEffect(() => {
    if (!open) return undefined

    const close = () => setOpen(false)
    const onKey = (event) => {
      if (event.key === 'Escape') close()
    }
    const onPointer = (event) => {
      if (
        menuRef.current?.contains(event.target)
        || buttonRef.current?.contains(event.target)
      ) return
      close()
    }

    window.addEventListener('keydown', onKey)
    window.addEventListener('mousedown', onPointer)
    window.addEventListener('scroll', placeMenu, true)
    window.addEventListener('resize', placeMenu)

    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onPointer)
      window.removeEventListener('scroll', placeMenu, true)
      window.removeEventListener('resize', placeMenu)
    }
  }, [open])

  const items = [
    current !== 'details' && {
      key: 'details',
      label: 'View vendor details',
      icon: Eye,
      onSelect: () => navigate(`/vendors/${vendor.id}`),
    },
    {
      key: 'status',
      label: 'Update vendor account',
      icon: Pencil,
      onSelect: () => (onUpdateAccount ? onUpdateAccount() : setStatusOpen(true)),
    },
    current !== 'products' && {
      key: 'products',
      label: 'View products',
      icon: Package,
      onSelect: () => navigate(`/vendors/${vendor.id}/products`),
    },
  ].filter(Boolean)

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`Actions for ${vendor.store}`}
        onClick={(event) => {
          event.stopPropagation()
          setOpen((value) => {
            if (!value) {
              setCoords((current) => ({ ...current, ready: false }))
            }
            return !value
          })
        }}
        className="inline-flex size-9 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:border-brand/40 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
      >
        <MoreHorizontal className="size-4" />
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={`${vendor.store} actions`}
          data-placement={coords.placement}
          style={{
            top: coords.top,
            left: coords.left,
            maxHeight: coords.maxHeight,
            visibility: coords.ready ? 'visible' : 'hidden',
          }}
          className={`fixed z-[60] min-w-56 overflow-y-auto rounded-2xl border border-slate-200 bg-white py-1.5 shadow-[0_24px_60px_rgba(15,23,42,0.16)] ${
            coords.placement === 'up' ? 'origin-bottom-right' : 'origin-top-right'
          }`}
        >
          {items.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.key}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false)
                  action.onSelect()
                }}
                className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950 focus-visible:bg-brand-light focus-visible:outline-none"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                  <Icon className="size-4" strokeWidth={2} />
                </span>
                {action.label}
              </button>
            )
          })}

          <div className="mt-1.5 border-t border-slate-200 pt-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                if (onSuspend) onSuspend()
                else setSuspendOpen(true)
              }}
              className={`flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-semibold transition-colors focus-visible:outline-none ${
                isSuspended
                  ? 'text-emerald-700 hover:bg-emerald-50 focus-visible:bg-emerald-50'
                  : 'text-rose-700 hover:bg-rose-50 focus-visible:bg-rose-50'
              }`}
            >
              <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                isSuspended ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}>
                {isSuspended ? <RotateCcw className="size-4" strokeWidth={2} /> : <Ban className="size-4" strokeWidth={2} />}
              </span>
              {isSuspended ? 'Reinstate vendor' : 'Suspend'}
            </button>
          </div>
        </div>,
        document.body,
      )}

      {ownsModals && (
        <>
          <VendorStatusModal
            open={statusOpen}
            vendor={vendor}
            onClose={() => setStatusOpen(false)}
            onRequestSuspend={() => setSuspendOpen(true)}
          />
          <VendorSuspendModal
            open={suspendOpen}
            vendor={vendor}
            onClose={() => setSuspendOpen(false)}
          />
        </>
      )}
    </>
  )
}
