import { useDeferredValue, useEffect, useId, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Search, X } from 'lucide-react'
import Container from '../layout/Container'
import { usePinnedWhenPast } from '../../hooks/usePinnedWhenPast'
import { useSiteHeaderHeight } from '../../hooks/useSiteHeaderHeight'
import {
  buildCategoriesPageSearchIndex,
  filterCategoriesPageSearch,
  scrollToCategoryDepartment,
} from '../../utils/buildCategoriesPageSearchIndex'

const RESULT_LIMIT = 12
const STICKY_OVERLAP_PX = 8

function ResultThumb({ image, title }) {
  return (
    <span className="flex size-11 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200/80">
      {image ? (
        <img src={image} alt="" className="size-full object-cover" />
      ) : (
        <span className="m-auto text-xs font-bold text-slate-400">{title.slice(0, 1)}</span>
      )}
    </span>
  )
}

export default function CategoriesPageSearch({ parentCategories = [] }) {
  const navigate = useNavigate()
  const headerHeight = useSiteHeaderHeight()
  const inputId = useId()
  const listboxId = useId()
  const sentinelRef = useRef(null)
  const containerRef = useRef(null)
  const dockRef = useRef(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const deferredQuery = useDeferredValue(query)
  const stuck = usePinnedWhenPast(sentinelRef, headerHeight)

  const searchIndex = useMemo(
    () => buildCategoriesPageSearchIndex(parentCategories),
    [parentCategories],
  )

  const results = useMemo(
    () => filterCategoriesPageSearch(searchIndex, deferredQuery, RESULT_LIMIT),
    [deferredQuery, searchIndex],
  )

  const showResults = open && deferredQuery.trim().length > 0
  const activeResult = results[activeIndex] ?? null

  useEffect(() => {
    setActiveIndex(0)
  }, [deferredQuery])

  useEffect(() => {
    if (!open) return undefined

    const handlePointerDown = (event) => {
      if (containerRef.current?.contains(event.target)) return
      setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  useEffect(() => {
    const dock = dockRef.current
    const update = () => {
      const dockHeight = dock ? Math.round(dock.getBoundingClientRect().height) : 56
      const margin = Math.max(headerHeight + dockHeight, 96)
      document.documentElement.style.setProperty('--categories-scroll-margin', `${margin}px`)
    }

    update()
    if (!dock) return undefined

    const observer = new ResizeObserver(update)
    observer.observe(dock)

    return () => {
      observer.disconnect()
      document.documentElement.style.removeProperty('--categories-scroll-margin')
    }
  }, [headerHeight, stuck])

  const selectResult = (result) => {
    if (!result) return

    setQuery('')
    setOpen(false)

    if (result.type === 'department' && scrollToCategoryDepartment(result.slug)) {
      return
    }

    navigate(result.href)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setOpen(false)
      return
    }

    if (!results.length) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      setActiveIndex((index) => (index + 1) % results.length)
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setOpen(true)
      setActiveIndex((index) => (index - 1 + results.length) % results.length)
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      selectResult(activeResult ?? results[0])
    }
  }

  return (
    <>
      <div ref={sentinelRef} className="h-px w-full" aria-hidden />
      <div
        ref={dockRef}
        className={`sticky z-[95] bg-white py-2 ${
          stuck ? 'border-b border-slate-200 shadow-sm shadow-slate-900/8' : ''
        }`}
        style={{ top: Math.max(headerHeight - STICKY_OVERLAP_PX, 0) }}
      >
        <Container>
          <div ref={containerRef} className="relative w-full max-w-xl">
            <form role="search" onSubmit={(event) => event.preventDefault()}>
              <label htmlFor={inputId} className="sr-only">
                Search categories
              </label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400"
                  strokeWidth={2.25}
                  aria-hidden
                />
                <input
                  id={inputId}
                  type="search"
                  role="combobox"
                  autoComplete="off"
                  spellCheck="false"
                  value={query}
                  placeholder="Search departments or categories"
                  aria-autocomplete="list"
                  aria-expanded={showResults}
                  aria-controls={listboxId}
                  aria-activedescendant={
                    showResults && activeResult ? `${listboxId}-${activeResult.id}` : undefined
                  }
                  onChange={(event) => {
                    setQuery(event.target.value)
                    setOpen(true)
                  }}
                  onFocus={() => setOpen(true)}
                  onKeyDown={handleKeyDown}
                  className="h-12 w-full rounded-full border border-slate-200 bg-white pr-12 pl-11 text-sm text-slate-900 outline-none placeholder:text-slate-400 transition focus:border-auth-primary focus:ring-2 focus:ring-auth-primary/15 [&::-webkit-search-cancel-button]:hidden"
                />
                {query ? (
                  <button
                    type="button"
                    aria-label="Clear category search"
                    onClick={() => {
                      setQuery('')
                      setOpen(false)
                    }}
                    className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X className="size-4" strokeWidth={2.25} aria-hidden />
                  </button>
                ) : null}
              </div>
            </form>

            {showResults ? (
              <ul
                id={listboxId}
                role="listbox"
                aria-label="Category search results"
                className="absolute z-40 mt-2 max-h-80 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white py-1.5 shadow-lg shadow-slate-900/8"
              >
                {results.length === 0 ? (
                  <li className="px-4 py-6 text-center">
                    <p className="text-sm font-semibold text-slate-900">No matching categories</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Try another department or subcategory name.
                    </p>
                  </li>
                ) : (
                  results.map((result, index) => {
                    const selected = index === activeIndex

                    return (
                      <li key={result.id} role="none">
                        <button
                          type="button"
                          id={`${listboxId}-${result.id}`}
                          role="option"
                          aria-selected={selected}
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => selectResult(result)}
                          className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                            selected ? 'bg-auth-primary/8' : 'hover:bg-slate-50'
                          }`}
                        >
                          <ResultThumb image={result.image} title={result.title} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-slate-900">
                              {result.title}
                            </span>
                            <span className="mt-0.5 block truncate text-xs text-slate-500">
                              {result.type === 'department'
                                ? 'Jump to department'
                                : `In ${result.parentTitle}`}
                            </span>
                          </span>
                        </button>
                      </li>
                    )
                  })
                )}
              </ul>
            ) : null}
          </div>
        </Container>
      </div>
    </>
  )
}
