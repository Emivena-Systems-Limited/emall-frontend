import { Search } from 'lucide-react'

export default function GuideNav({ groups, activeId, query, onQueryChange, onSelect, layout = 'inline' }) {
  const q = query.trim().toLowerCase()
  const filtered = groups
    .map((group) => ({
      ...group,
      items: q
        ? group.items.filter((item) => item.label.toLowerCase().includes(q) || item.id.includes(q))
        : group.items,
    }))
    .filter((group) => group.items.length > 0)
  const isPanel = layout === 'panel'

  const search = (
    <label className="relative block">
      <span className="sr-only">Search sections</span>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search the guide…"
        className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand-light"
      />
    </label>
  )

  const list = filtered.length === 0 ? (
    <p className="rounded-xl border border-dashed border-slate-200 bg-white px-3 py-4 text-sm text-slate-500">
      No matching sections. Try <span className="font-semibold text-slate-700">auth</span>,{' '}
      <span className="font-semibold text-slate-700">analytics</span>, or{' '}
      <span className="font-semibold text-slate-700">routing</span>.
    </p>
  ) : (
    <div className="space-y-5">
      {filtered.map((group) => (
        <div key={group.id}>
          <p className="px-3 text-[10px] font-bold tracking-[0.16em] text-slate-400 uppercase">{group.label}</p>
          <ul className="mt-1.5 space-y-0.5">
            {group.items.map((item) => {
              const active = item.id === activeId
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(event) => {
                      event.preventDefault()
                      onSelect?.(item.id)
                    }}
                    className={`flex cursor-pointer items-center rounded-xl px-3 py-2 text-sm transition-colors ${
                      active
                        ? 'bg-brand-light font-semibold text-brand'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )

  if (!isPanel) {
    return (
      <nav aria-label="Guide sections" className="space-y-4">
        {search}
        {list}
      </nav>
    )
  }

  return (
    <nav aria-label="Guide sections" className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-slate-100 px-4 py-4">{search}</div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4">
        {list}
      </div>
    </nav>
  )
}
