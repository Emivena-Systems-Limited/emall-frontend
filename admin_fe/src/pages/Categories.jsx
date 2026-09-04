import { useMemo, useState } from 'react'
import { FolderTree, Plus, Search } from 'lucide-react'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import DashboardReveal from '../components/dashboard/DashboardReveal'
import EmptyState from '../components/dashboard/EmptyState'
import CategoryStatsGrid from '../components/categories/CategoryStatsGrid'
import CategoryTree from '../components/categories/CategoryTree'
import CategoryParentsList from '../components/categories/CategoryParentsList'
import { CategoryRosterSkeleton } from '../components/categories/CategoryIdentity'
import CategoryFormDrawer from '../components/categories/CategoryFormDrawer'
import CategoryFeaturedModal from '../components/categories/CategoryFeaturedModal'
import CategoryRemoveModal from '../components/categories/CategoryRemoveModal'
import { CATEGORY_VIEWS } from '../constants/categories'
import { useAdminCategories } from '../hooks/useAdminCategories'
import { formatCount } from '../utils/formatters'
import { parseApiError } from '../utils/parseApiError'
import { countCategoryTree, filterCategoryTree, categoryMatchesQuery } from '../utils/normalizeAdminCategories'

export default function Categories() {
  const [view, setView] = useState('tree')
  const [query, setQuery] = useState('')
  const [composer, setComposer] = useState(null)
  const [featuring, setFeaturing] = useState(null)
  const [removing, setRemoving] = useState(null)
  const { parents, tree, isLoading, isError, error, refetch } = useAdminCategories()

  const summary = useMemo(() => countCategoryTree(tree), [tree])
  const filteredTree = useMemo(() => filterCategoryTree(tree, query), [tree, query])
  const hasQuery = Boolean(query.trim())
  const visibleCount = view === 'tree'
    ? countCategoryTree(filteredTree).total
    : parents.filter((category) => categoryMatchesQuery(category, query)).length

  const openCreate = (parentId = null) => setComposer({ mode: 'create', parentId })
  const openEdit = (category) => setComposer({ mode: 'edit', category })

  return (
    <DashboardLayout pageTitle="Categories">
      <div className="page-enter space-y-5">
        <DashboardReveal index={0}>
          <header className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:px-6">
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-brand" />
            <div className="flex min-w-0 flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-light ring-1 ring-brand-muted">
                  <FolderTree className="size-5 text-brand" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
                    Marketplace
                  </p>
                  <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                    Categories
                  </h2>
                  <p className="mt-1.5 text-sm text-slate-500">
                    Open a department to manage the subcategories nested under it.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => openCreate()}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                <Plus className="size-4" aria-hidden="true" />
                New category
              </button>
            </div>
          </header>
        </DashboardReveal>

        <DashboardReveal index={1}>
          <CategoryStatsGrid summary={summary} />
        </DashboardReveal>

        <DashboardReveal index={2}>
          <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:p-5">
            <div className="flex flex-wrap gap-2">
              {CATEGORY_VIEWS.map((item) => {
                const active = view === item.key
                const count = item.key === 'tree' ? summary.total : parents.length
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setView(item.key)}
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
                      active
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                    <span className={`tabular-nums ${active ? 'text-white/70' : 'text-slate-400'}`}>
                      {formatCount(count)}
                    </span>
                  </button>
                )
              })}
            </div>

            <label className="relative mt-4 block min-w-0">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search category name"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pr-3 pl-10 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand-light"
              />
            </label>
          </section>
        </DashboardReveal>

        <DashboardReveal index={3}>
          {isLoading ? (
            <CategoryRosterSkeleton />
          ) : isError ? (
            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
              <EmptyState
                icon={FolderTree}
                title="Could not load categories"
                description={parseApiError(error, 'The category catalogue is unavailable right now.').message}
                action={(
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                  >
                    Try again
                  </button>
                )}
              />
            </section>
          ) : view === 'tree' ? (
            <CategoryTree
              categories={filteredTree}
              hasQuery={hasQuery}
              onClearQuery={() => setQuery('')}
              onAdd={() => openCreate()}
              onAddChild={(category) => openCreate(category.id)}
              onToggleFeatured={setFeaturing}
              onEdit={openEdit}
              onRemove={setRemoving}
            />
          ) : (
            <CategoryParentsList
              categories={parents}
              query={query}
              onClearQuery={() => setQuery('')}
              onAddChild={(category) => openCreate(category.id)}
              onToggleFeatured={setFeaturing}
              onEdit={openEdit}
              onRemove={setRemoving}
            />
          )}
        </DashboardReveal>

        {!isLoading && !isError && (
          <p className="px-1 text-xs text-slate-400">
            Showing {formatCount(visibleCount)} {view === 'tree' ? 'categories in the tree' : 'parent categories'}
            {hasQuery ? ' matching this search' : ''}.
          </p>
        )}
      </div>

      <CategoryFormDrawer
        open={Boolean(composer)}
        mode={composer?.mode ?? 'create'}
        category={composer?.category ?? null}
        parentId={composer?.parentId ?? null}
        tree={tree}
        onClose={() => setComposer(null)}
      />
      <CategoryFeaturedModal
        open={Boolean(featuring)}
        category={featuring}
        onClose={() => setFeaturing(null)}
      />
      <CategoryRemoveModal
        open={Boolean(removing)}
        category={removing}
        onClose={() => setRemoving(null)}
      />
    </DashboardLayout>
  )
}
