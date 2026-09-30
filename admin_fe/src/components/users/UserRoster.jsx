import { useState } from 'react'
import { ChevronLeft, ChevronRight, Users } from 'lucide-react'
import EmptyState from '../dashboard/EmptyState'
import { formatCount, formatOrderMoney } from '../../utils/formatters'
import { formatUserDate } from '../../utils/normalizeAdminUsers'
import { formatPhoneDisplay } from '../../utils/phoneUtils'
import UserActions from './UserActions'
import UserIdentity, { UserRosterSkeleton } from './UserIdentity'
import UserStatusBadge from './UserStatusBadge'

export { UserRosterSkeleton }

export default function UserRoster({
  users, total, rangeStart, rangeEnd, page, totalPages, onPageChange,
  onClearFilters, hasFilters = false, onStatus, onView,
}) {
  const [selected, setSelected] = useState([])
  const pageIds = users.map((user) => String(user.id))
  const allSelected = pageIds.length > 0 && pageIds.every((id) => selected.includes(id))
  const toggleAll = () => setSelected(allSelected ? selected.filter((id) => !pageIds.includes(id)) : [...new Set([...selected, ...pageIds])])
  const toggle = (id) => setSelected((current) => current.includes(String(id)) ? current.filter((item) => item !== String(id)) : [...current, String(id)])

  if (total === 0) {
    return (
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
        <EmptyState icon={Users} title={hasFilters ? 'No customers match these filters' : 'No customers yet'} description={hasFilters ? 'Try another search or reset the current filters.' : 'Customer accounts will appear here when they become available.'} action={hasFilters ? <button type="button" onClick={onClearFilters} className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">Reset filters</button> : null} />
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      {selected.length > 0 && <div className="border-b border-slate-100 bg-brand-light px-5 py-2 text-xs font-semibold text-brand">{selected.length} customer{selected.length === 1 ? '' : 's'} selected</div>}
      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-[1380px] w-full text-left text-sm">
          <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="w-10 px-4 py-3"><input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all customers on this page" className="size-4 accent-[#c73b2d]" /></th>
              <th className="px-3 py-3">Customer</th><th className="px-3 py-3">Customer ID</th><th className="px-3 py-3">Email</th><th className="px-3 py-3">Phone number</th><th className="px-3 py-3">Location</th><th className="px-3 py-3">Total orders</th><th className="px-3 py-3">Total spent</th><th className="px-3 py-3">Account status</th><th className="px-3 py-3">Date joined</th><th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} onDoubleClick={() => onView?.(user)} className="transition-colors hover:bg-slate-50/80">
                <td className="px-4 py-3"><input type="checkbox" checked={selected.includes(String(user.id))} onChange={() => toggle(user.id)} aria-label={`Select ${user.name}`} className="size-4 accent-[#c73b2d]" /></td>
                <td className="px-3 py-3"><button type="button" onClick={() => onView?.(user)} className="cursor-pointer text-left"><UserIdentity user={user} compact /></button></td>
                <td className="max-w-32 px-3 py-3 font-mono text-xs text-slate-500"><span className="block truncate" title={user.id}>{user.id}</span></td>
                <td className="max-w-48 px-3 py-3 text-slate-600"><span className="block truncate" title={user.email}>{user.email || '—'}</span></td>
                <td className="whitespace-nowrap px-3 py-3 text-slate-600">{user.phone ? formatPhoneDisplay(user.phone) : '—'}</td>
                <td className="max-w-44 px-3 py-3 text-slate-600"><p className="truncate">{user.locationLabel || '—'}</p>{user.district && <p className="mt-0.5 truncate text-[11px] text-slate-400">{user.district}</p>}</td>
                <td className="px-3 py-3 tabular-nums text-slate-700">{formatCount(user.counts?.orders ?? 0)}</td>
                <td className="whitespace-nowrap px-3 py-3 font-semibold tabular-nums text-slate-800">{formatOrderMoney(user.counts?.spent ?? 0)}</td>
                <td className="px-3 py-3"><UserStatusBadge status={user.status} /></td>
                <td className="whitespace-nowrap px-3 py-3 text-slate-600">{formatUserDate(user.joinedAt)}</td>
                <td className="px-4 py-3 text-right"><UserActions user={user} onView={onView} onViewOrders={(item) => onView?.(item, 'orders')} onStatus={onStatus} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="divide-y divide-slate-100 lg:hidden">
        {users.map((user) => <li key={user.id} className="p-4"><div className="flex items-start gap-3"><input type="checkbox" checked={selected.includes(String(user.id))} onChange={() => toggle(user.id)} className="mt-1 size-4 accent-[#c73b2d]" /><button type="button" onClick={() => onView?.(user)} className="min-w-0 flex-1 cursor-pointer text-left"><div className="flex justify-between gap-2"><UserIdentity user={user} /><UserStatusBadge status={user.status} compact /></div><p className="mt-2 text-xs text-slate-500">{user.locationLabel || 'No location'} · {formatCount(user.counts?.orders ?? 0)} orders · {formatOrderMoney(user.counts?.spent ?? 0)}</p><p className="mt-1 text-xs text-slate-400">Joined {formatUserDate(user.joinedAt)}</p></button><UserActions user={user} onView={onView} onViewOrders={(item) => onView?.(item, 'orders')} onStatus={onStatus} /></div></li>)}
      </ul>
      <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="text-xs text-slate-500">Showing <span className="font-semibold text-slate-700">{rangeStart}–{rangeEnd}</span> of <span className="font-semibold text-slate-700">{formatCount(total)}</span> customers</p>
        <div className="flex items-center gap-2"><button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="size-3.5" /> Prev</button><span className="min-w-16 text-center text-xs font-semibold text-slate-600">{page} / {totalPages}</span><button type="button" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40">Next <ChevronRight className="size-3.5" /></button></div>
      </div>
    </section>
  )
}
