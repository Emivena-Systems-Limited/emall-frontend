import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, FolderTree } from 'lucide-react'
import EmptyState from '../dashboard/EmptyState'
import { formatCount } from '../../utils/formatters'
import { collectExpandableIds } from '../../utils/normalizeAdminCategories'
import CategoryIdentity from './CategoryIdentity'
import CategoryStatusBadge from './CategoryStatusBadge'
import CategoryActions from './CategoryActions'

function nestedLabel(count) {
  if (count === 1) return '1 subcategory'
  return `${formatCount(count)} subcategories`
}

function AccordionNode({ category, depth, expandedIds, onToggle, onAddChild, onEdit, onRemove }) {
  const childCount = category.children?.length ?? 0
  const expanded = expandedIds.has(category.id)
  const isRoot = depth === 0
  const nested = depth > 0
  const canExpand = childCount > 0
  const deep = depth > 1
  const panelId = `category-panel-${category.id}`
  const triggerId = `category-trigger-${category.id}`

  return (
    <article
      className={
        isRoot
          ? `overflow-hidden rounded-2xl border bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)] transition-shadow ${
            expanded ? 'border-slate-300 shadow-[0_18px_40px_rgba(15,23,42,0.07)]' : 'border-slate-200/80'
          }`
          : deep
            ? 'overflow-hidden rounded-lg border border-dashed border-slate-300 bg-white/80'
            : 'overflow-hidden rounded-xl border border-dashed border-brand/25 bg-brand-light/40'
      }
    >
      <div className={`flex items-center gap-2 ${nested ? 'px-2.5 py-2 sm:px-3' : 'px-3 py-2.5 sm:px-4'}`}>
        {canExpand ? (
          <button
            type="button"
            id={triggerId}
            onClick={() => onToggle(category.id)}
            aria-expanded={expanded}
            aria-controls={panelId}
            className="flex min-h-11 min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-xl px-1 text-left transition-colors hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <span
              className={`flex shrink-0 items-center justify-center rounded-xl ring-1 transition-colors duration-300 ${
                nested ? 'size-8' : 'size-9'
              } ${
                expanded
                  ? 'bg-brand-light text-brand ring-brand-muted'
                  : nested
                    ? 'bg-white text-brand ring-brand-muted'
                    : 'bg-slate-100 text-slate-500 ring-slate-200'
              }`}
            >
              <ChevronDown className={`size-4 transition-transform duration-300 ease-out motion-reduce:transition-none ${expanded ? '' : '-rotate-90'}`} />
            </span>
            <CategoryIdentity category={category} compact={nested} nested={nested} />
            <span className={`ml-auto hidden shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 sm:inline-flex ${
              expanded
                ? 'bg-brand-light text-brand ring-brand-muted'
                : nested
                  ? 'bg-white text-slate-600 ring-brand-muted'
                  : 'bg-slate-50 text-slate-600 ring-slate-200'
            }`}
            >
              {expanded ? 'Hide' : 'Show'} · {nestedLabel(childCount)}
            </span>
          </button>
        ) : (
          <div className="flex min-h-11 min-w-0 flex-1 items-center gap-3 px-1">
            {nested ? (
              <span className="flex size-8 shrink-0 items-center justify-center" aria-hidden="true">
                <span className="h-4 w-3 rounded-bl-md border-b-2 border-l-2 border-brand/35" />
              </span>
            ) : (
              <span className="flex size-9 shrink-0 items-center justify-center">
                <span className="size-1.5 rounded-full bg-slate-300" aria-hidden="true" />
              </span>
            )}
            <CategoryIdentity category={category} compact nested={nested} />
          </div>
        )}

        <div className="hidden md:block">
          <CategoryStatusBadge active={category.isActive} featured={category.isFeatured} />
        </div>
        <CategoryActions
          category={category}
          onAddChild={isRoot ? onAddChild : undefined}
          onEdit={onEdit}
          onRemove={onRemove}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 px-4 pb-3 md:hidden">
        <CategoryStatusBadge active={category.isActive} featured={category.isFeatured} />
        {canExpand ? (
          <span className="text-[11px] font-semibold text-slate-500">
            {expanded ? 'Hide' : 'Show'} · {nestedLabel(childCount)}
          </span>
        ) : null}
      </div>

      {canExpand ? (
        <div
          id={panelId}
          role="region"
          aria-labelledby={triggerId}
          aria-hidden={!expanded}
          inert={!expanded}
          data-open={expanded ? 'true' : 'false'}
          className="category-accordion"
        >
          <div className="category-accordion-inner">
            <div className={`category-accordion-body border-t px-3 py-3 sm:px-4 ${isRoot ? 'border-slate-100 bg-slate-50/90' : 'border-brand/10 bg-white/50'}`}>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Nested under {category.name}
              </p>
              <div className={`space-y-2 pl-3 ${isRoot ? 'border-l-2 border-brand/40' : 'border-l-2 border-dashed border-brand/25'}`}>
                {category.children.map((child) => (
                  <AccordionNode
                    key={child.id}
                    category={child}
                    depth={depth + 1}
                    expandedIds={expandedIds}
                    onToggle={onToggle}
                    onEdit={onEdit}
                    onRemove={onRemove}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  )
}

export default function CategoryTree({
  categories = [],
  hasQuery = false,
  onClearQuery,
  onAdd,
  onAddChild,
  onEdit,
  onRemove,
}) {
  const expandableIds = useMemo(() => collectExpandableIds(categories), [categories])
  const [expandedIds, setExpandedIds] = useState(() => new Set())

  const expandableKey = expandableIds.join('|')

  useEffect(() => {
    if (hasQuery) {
      setExpandedIds(new Set(expandableIds))
      return
    }
    setExpandedIds(new Set())
  }, [hasQuery, expandableKey, expandableIds])

  const toggle = (id) => {
    setExpandedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const expandAll = () => setExpandedIds(new Set(expandableIds))
  const collapseAll = () => setExpandedIds(new Set())
  const allOpen = expandableIds.length > 0 && expandableIds.every((id) => expandedIds.has(id))

  if (categories.length === 0) {
    return (
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
        <EmptyState
          icon={FolderTree}
          title={hasQuery ? 'No categories match this search' : 'No categories yet'}
          description={
            hasQuery
              ? 'Try a different name, or clear the search to see the full tree.'
              : 'Departments and their subcategories will appear here once they are in the catalogue.'
          }
          action={hasQuery ? (
            <button
              type="button"
              onClick={onClearQuery}
              className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Clear search
            </button>
          ) : onAdd ? (
            <button
              type="button"
              onClick={onAdd}
              className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              New category
            </button>
          ) : null}
        />
      </section>
    )
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:px-5">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-900">Departments</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Open a department to see the subcategories nested under it.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {expandableIds.length > 0 && (
            <button
              type="button"
              onClick={allOpen ? collapseAll : expandAll}
              className="inline-flex cursor-pointer items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-brand/40 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              {allOpen ? 'Collapse all' : 'Expand all'}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {categories.map((category) => (
          <AccordionNode
            key={category.id}
            category={category}
            depth={0}
            expandedIds={expandedIds}
            onToggle={toggle}
            onAddChild={onAddChild}
            onEdit={onEdit}
            onRemove={onRemove}
          />
        ))}
      </div>
    </section>
  )
}
