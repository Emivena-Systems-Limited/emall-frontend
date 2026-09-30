import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Search } from 'lucide-react'

const PANEL_GAP = 6
const VIEWPORT_PAD = 8

function getPanelPosition(trigger, panel) {
  const rect = trigger.getBoundingClientRect()
  const panelHeight = panel?.offsetHeight || 280
  const width = rect.width
  const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_PAD
  const spaceAbove = rect.top - VIEWPORT_PAD
  const openUp = spaceBelow < panelHeight + PANEL_GAP && spaceAbove > spaceBelow

  let top = openUp ? rect.top - PANEL_GAP - panelHeight : rect.bottom + PANEL_GAP
  top = Math.min(Math.max(top, VIEWPORT_PAD), window.innerHeight - panelHeight - VIEWPORT_PAD)

  let left = rect.left
  left = Math.min(Math.max(left, VIEWPORT_PAD), window.innerWidth - width - VIEWPORT_PAD)

  return { top, left, width }
}

export default function SearchableOptionSelect({
  id,
  value = '',
  onChange,
  options = [],
  label = 'Options',
  includeAll = false,
  allLabel = 'All',
  placeholder = 'Select',
  searchPlaceholder = 'Search',
  loading = false,
  error = false,
  loadingMessage = 'Loading…',
  errorMessage = 'Could not load options.',
  emptyMessage = 'No matches.',
  disabled = false,
}) {
  const listId = useId()
  const buttonRef = useRef(null)
  const panelRef = useRef(null)
  const searchRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [position, setPosition] = useState(null)

  const selectedName = options.find((option) => String(option.id) === String(value))?.name
    ?? (includeAll && value === '' ? allLabel : placeholder)

  const visibleOptions = useMemo(() => {
    const queryText = query.trim().toLowerCase()
    const matches = options.filter((option) => option.name.toLowerCase().includes(queryText))
    const showAll = includeAll && (!queryText || allLabel.toLowerCase().includes(queryText))
    return showAll ? [{ id: '', name: allLabel }, ...matches] : matches
  }, [allLabel, includeAll, options, query])

  const placePanel = () => {
    const trigger = buttonRef.current
    if (!trigger) return
    setPosition(getPanelPosition(trigger, panelRef.current))
  }

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null)
      return undefined
    }
    placePanel()
    const frame = window.requestAnimationFrame(placePanel)
    return () => window.cancelAnimationFrame(frame)
  }, [open, visibleOptions.length])

  useEffect(() => {
    if (!open) return undefined
    const active = panelRef.current?.querySelector('[data-active="true"]')
    active?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, open, visibleOptions.length])

  useEffect(() => {
    if (!open) return undefined
    searchRef.current?.focus()

    const handlePointer = (event) => {
      if (
        buttonRef.current?.contains(event.target)
        || panelRef.current?.contains(event.target)
      ) return
      setOpen(false)
    }
    const handleKey = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
        setQuery('')
      }
    }

    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('keydown', handleKey)
    window.addEventListener('scroll', placePanel, true)
    window.addEventListener('resize', placePanel)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('keydown', handleKey)
      window.removeEventListener('scroll', placePanel, true)
      window.removeEventListener('resize', placePanel)
    }
  }, [open])

  const selectedIndex = () => {
    if (includeAll && String(value) === '') return 0
    const index = options.findIndex((option) => String(option.id) === String(value))
    if (index < 0) return 0
    return includeAll ? index + 1 : index
  }

  const openMenu = () => {
    setQuery('')
    setActiveIndex(selectedIndex())
    setOpen(true)
  }

  const choose = (optionId) => {
    onChange(optionId)
    setQuery('')
    setActiveIndex(0)
    setOpen(false)
  }

  const moveActive = (direction) => {
    if (!visibleOptions.length) return
    setActiveIndex((current) => (current + direction + visibleOptions.length) % visibleOptions.length)
  }

  return (
    <div>
      <button
        ref={buttonRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          if (disabled) return
          if (open) {
            setOpen(false)
            return
          }
          openMenu()
        }}
        onKeyDown={(event) => {
          if (disabled) return
          if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            openMenu()
          }
        }}
        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-sm text-slate-900 outline-none transition-colors hover:border-slate-300 focus:border-brand focus:ring-2 focus:ring-brand-light disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
      >
        <span className="truncate">{selectedName}</span>
        <ChevronDown className={`size-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open ? createPortal(
        <div
          ref={panelRef}
          style={{
            top: position?.top ?? -9999,
            left: position?.left ?? 0,
            width: position?.width,
            visibility: position ? 'visible' : 'hidden',
          }}
          className="fixed z-[80] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.16)]"
        >
          <div className="border-b border-slate-100 p-2">
            <label className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2">
              <Search className="size-3.5 shrink-0 text-slate-400" />
              <span className="sr-only">{searchPlaceholder}</span>
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setActiveIndex(0)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowDown') {
                    event.preventDefault()
                    moveActive(1)
                  } else if (event.key === 'ArrowUp') {
                    event.preventDefault()
                    moveActive(-1)
                  } else if (event.key === 'Enter') {
                    event.preventDefault()
                    const option = visibleOptions[activeIndex]
                    if (option) choose(option.id)
                  } else if (event.key === 'Escape') {
                    event.preventDefault()
                    setOpen(false)
                    setQuery('')
                  }
                }}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </label>
          </div>
          <ul id={listId} role="listbox" aria-label={label} className="max-h-56 overflow-y-auto p-1.5">
            {loading && options.length === 0 ? (
              <li className="px-3 py-2.5 text-sm text-slate-500">{loadingMessage}</li>
            ) : error && options.length === 0 ? (
              <li className="px-3 py-2.5 text-sm text-slate-500">{errorMessage}</li>
            ) : visibleOptions.length === 0 ? (
              <li className="px-3 py-2.5 text-sm text-slate-500">{emptyMessage}</li>
            ) : visibleOptions.map((option, index) => {
              const selected = String(option.id) === String(value)
              const active = index === activeIndex
              return (
                <li key={option.id || 'all'} role="presentation">
                  <button
                    type="button"
                    role="option"
                    data-active={active ? 'true' : 'false'}
                    aria-selected={selected}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => choose(option.id)}
                    className={`w-full cursor-pointer truncate rounded-lg px-3 py-2 text-left text-sm ${
                      active
                        ? 'bg-slate-100 font-semibold text-slate-950'
                        : selected
                          ? 'font-semibold text-slate-950'
                          : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {option.name}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>,
        document.body,
      ) : null}
    </div>
  )
}
