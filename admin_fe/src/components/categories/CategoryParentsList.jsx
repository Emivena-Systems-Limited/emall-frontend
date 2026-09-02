import { Layers } from 'lucide-react'
import EmptyState from '../dashboard/EmptyState'
import { formatCount } from '../../utils/formatters'
import { categoryMatchesQuery } from '../../utils/normalizeAdminCategories'
import CategoryIdentity from './CategoryIdentity'
import CategoryStatusBadge from './CategoryStatusBadge'
import CategoryActions from './CategoryActions'

export default function CategoryParentsList({
  categories,
  query = '',
  onClearQuery,
  onAddChild,
  onEdit,
  onRemove,
}) {
  const filtered = categories.filter((category) => categoryMatchesQuery(category, query))
  const hasQuery = Boolean(String(query).trim())

  if (filtered.length === 0) {
    return (
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
        <EmptyState
          icon={Layers}
          title={hasQuery ? 'No parents match this search' : 'No parent categories yet'}
          description={
            hasQuery
              ? 'Try a different name, or clear the search to see every parent.'
              : 'Top-level departments will appear here once they are in the catalogue.'
          }
          action={hasQuery ? (
            <button
              type="button"
              onClick={onClearQuery}
              className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Clear search
            </button>
          ) : null}
        />
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-2.5">Parent</th>
              <th className="px-5 py-2.5">Nested</th>
              <th className="px-5 py-2.5">Status</th>
              <th className="px-5 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((category) => (
              <tr key={category.id} className="transition-colors hover:bg-slate-50/80">
                <td className="px-5 py-3">
                  <CategoryIdentity category={category} />
                </td>
                <td className="px-5 py-3 tabular-nums text-slate-600">
                  {formatCount(category.children?.length ?? 0)}
                </td>
                <td className="px-5 py-3">
                  <CategoryStatusBadge active={category.isActive} featured={category.isFeatured} />
                </td>
                <td className="px-5 py-3">
                  <CategoryActions category={category} onAddChild={onAddChild} onEdit={onEdit} onRemove={onRemove} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-slate-100 md:hidden">
        {filtered.map((category) => (
          <li key={category.id} className="px-4 py-4">
            <div className="flex items-start justify-between gap-2">
              <CategoryIdentity category={category} />
              <CategoryActions category={category} onAddChild={onAddChild} onEdit={onEdit} onRemove={onRemove} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <CategoryStatusBadge active={category.isActive} featured={category.isFeatured} />
              <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
                {formatCount(category.children?.length ?? 0)} nested
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
