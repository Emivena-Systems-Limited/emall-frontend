const statusStyles = {
  done: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'in-progress': 'bg-amber-50 text-amber-700 ring-amber-200',
  planned: 'bg-slate-100 text-slate-600 ring-slate-200',
}

export function StatusBadge({ status }) {
  const label = status === 'in-progress' ? 'In progress' : status.charAt(0).toUpperCase() + status.slice(1)

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${statusStyles[status] ?? statusStyles.planned}`}
    >
      {label}
    </span>
  )
}

export default function DocTable({ columns, rows, emptyMessage = 'Nothing documented yet.' }) {
  if (!rows.length) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
        {emptyMessage}
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full min-w-[540px] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-xs font-semibold tracking-wide text-slate-500 uppercase"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row, index) => (
            <tr key={row.id ?? index} className="hover:bg-slate-50/80">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 align-top text-slate-700">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
