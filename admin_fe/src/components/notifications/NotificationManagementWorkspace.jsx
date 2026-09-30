import { useMemo, useState } from 'react'
import { Bell, CalendarClock, CheckCircle2, Copy, Edit3, Eye, FileText, Mail, MessageSquareText, MoreHorizontal, RefreshCcw, Search, Send, Smartphone, Trash2, XCircle } from 'lucide-react'
import ConfirmModal from '../common/ConfirmModal'
import SlideDrawer from '../vendors/SlideDrawer'
import notify from '../../lib/notify'
import { AUDIENCE_OPTIONS, INITIAL_MANAGED_NOTIFICATIONS, INITIAL_NOTIFICATION_TEMPLATES, NOTIFICATION_AUDIENCES, NOTIFICATION_CHANNELS, NOTIFICATION_TABS, NOTIFICATION_TYPES } from '../../constants/notificationManagement'
import { useAdminUserRoster } from '../../hooks/useAdminUsers'
import { useAdminVendors } from '../../hooks/useAdminVendors'
import {
  useCancelManagedNotification,
  useCreateManagedNotification,
  useDeleteNotificationTemplate,
  useManagedNotifications,
  useManagedNotificationStats,
  useManagedNotificationTemplates,
  useResendManagedNotification,
  useRescheduleManagedNotification,
  useUpdateManagedNotification,
} from '../../hooks/useNotificationManagement'

const fieldClass = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand-light'

function formatDate(value) {
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function StatusBadge({ status }) {
  const styles = { Delivered: 'bg-emerald-50 text-emerald-700 ring-emerald-200', Scheduled: 'bg-amber-50 text-amber-700 ring-amber-200', Failed: 'bg-rose-50 text-rose-700 ring-rose-200', Cancelled: 'bg-slate-100 text-slate-500 ring-slate-200' }
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${styles[status] ?? 'bg-slate-100 text-slate-700 ring-slate-200'}`}>{status}</span>
}

function SummaryCards({ notifications, onSelect }) {
  const total = notifications.length
  const delivered = notifications.filter((item) => item.status === 'Delivered').length
  const failed = notifications.filter((item) => item.status === 'Failed').length
  const rows = [
    ['all', 'Total notifications', total, 'All campaigns', Bell, 'bg-slate-50 text-slate-700 ring-slate-200'],
    ['Delivered', 'Delivered', delivered, `${total ? Math.round((delivered / total) * 100) : 0}% of total`, CheckCircle2, 'bg-emerald-50 text-emerald-700 ring-emerald-200'],
    ['Scheduled', 'Scheduled', notifications.filter((item) => item.status === 'Scheduled').length, 'Awaiting send', CalendarClock, 'bg-amber-50 text-amber-700 ring-amber-200'],
    ['Failed', 'Failed', failed, `${total ? Math.round((failed / total) * 100) : 0}% need attention`, XCircle, 'bg-rose-50 text-rose-700 ring-rose-200'],
  ]
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{rows.map(([key, label, value, helper, Icon, tone]) => <button key={key} type="button" onClick={() => onSelect(key)} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-[0_10px_30px_rgba(15,23,42,0.035)] transition hover:-translate-y-0.5 hover:border-brand/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"><span className={`flex size-11 items-center justify-center rounded-xl ring-1 ring-inset ${tone}`}><Icon className="size-4.5" /></span><span><span className="block text-xs font-semibold text-slate-600">{label}</span><span className="block text-2xl font-bold text-slate-950">{value}</span><span className="block text-[11px] text-slate-400">{helper}</span></span></button>)}</div>
}

function ActionMenu({ item, onAction }) {
  const [open, setOpen] = useState(false)
  const actions = [['view', 'View details', Eye], ['duplicate', 'Duplicate', Copy], ...(item.status === 'Scheduled' ? [['edit', 'Edit', Edit3], ['cancel', 'Cancel', Trash2]] : []), ...(item.status === 'Failed' ? [['resend', 'Resend', RefreshCcw]] : [])]
  return <div className="relative"><button type="button" onClick={() => setOpen((value) => !value)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label={`Actions for ${item.title}`}><MoreHorizontal className="size-4" /></button>{open && <><button type="button" aria-label="Close actions" onClick={() => setOpen(false)} className="fixed inset-0 z-20 cursor-default" /><div className="absolute right-0 z-30 mt-1 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">{actions.map(([key, label, Icon]) => <button key={key} type="button" onClick={() => { setOpen(false); onAction(key, item) }} className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand"><Icon className="size-3.5" />{label}</button>)}</div></>}</div>
}

function NotificationTable({ items, onAction, emptyTitle = 'No notifications found' }) {
  if (!items.length) return <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center"><span className="flex size-14 items-center justify-center rounded-2xl bg-brand-light text-brand"><Bell className="size-5" /></span><h3 className="mt-4 font-bold text-slate-900">{emptyTitle}</h3><p className="mt-1 text-sm text-slate-500">Adjust the filters or create a new notification.</p></div>
  return <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left"><thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">Notification</th><th className="px-4 py-3">Recipients</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Sent / scheduled</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{items.map((item) => <tr key={item.id} className="hover:bg-slate-50/70"><td className="max-w-sm px-5 py-4"><p className="font-semibold text-slate-900">{item.title}</p><p className="mt-0.5 truncate text-xs text-slate-500">{item.message}</p><p className="mt-1 text-[10px] font-semibold text-slate-400">{item.id} · {item.channels.join(', ')}</p></td><td className="px-4 py-4"><p className="text-sm font-semibold text-slate-700">{item.recipients.toLocaleString()}</p><p className="text-[11px] text-slate-400">{item.audience}</p></td><td className="px-4 py-4 text-xs font-semibold text-slate-600">{item.type}</td><td className="px-4 py-4"><StatusBadge status={item.status} />{item.status === 'Delivered' && <p className="mt-1 text-[10px] text-slate-400">{item.deliveredRate}% delivered</p>}</td><td className="px-4 py-4 text-xs text-slate-600">{formatDate(item.date)}</td><td className="px-5 py-4"><div className="flex justify-end"><ActionMenu item={item} onAction={onAction} /></div></td></tr>)}</tbody></table></div>
}

const emptyForm = { title: '', message: '', audience: 'All Users', selectedRecipients: [], type: 'System', channels: ['In-App'], timing: 'now', scheduledAt: '' }

function Composer({ initialValue, templates, onSubmit, onCancel, audienceOptions = AUDIENCE_OPTIONS }) {
  const [form, setForm] = useState({ ...emptyForm, ...initialValue })
  const [recipientQuery, setRecipientQuery] = useState('')
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const options = audienceOptions[form.audience] ?? []
  const visibleOptions = options.filter((item) => `${item.name} ${item.detail}`.toLowerCase().includes(recipientQuery.toLowerCase()))
  const toggleChannel = (channel) => update('channels', form.channels.includes(channel) ? form.channels.filter((item) => item !== channel) : [...form.channels, channel])
  const submit = (event) => {
    event.preventDefault()
    if (!form.title.trim() || !form.message.trim() || !form.channels.length) return notify.error('Complete the required notification fields')
    if (form.audience.startsWith('Specific') && !form.selectedRecipients.length) return notify.error('Select at least one recipient')
    if (form.timing === 'later' && !form.scheduledAt) return notify.error('Choose a schedule date and time')
    onSubmit(form)
  }
  return <form onSubmit={submit} className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]"><div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.035)] sm:p-6"><div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand">Message</p><h3 className="mt-1 text-lg font-bold text-slate-950">Create a notification</h3><p className="mt-1 text-sm text-slate-500">Compose the message and choose who should receive it.</p></div><div className="grid gap-4 sm:grid-cols-2"><label className="space-y-1.5 sm:col-span-2"><span className="text-xs font-bold text-slate-700">Use a template <span className="font-normal text-slate-400">(optional)</span></span><select className={fieldClass} defaultValue="" onChange={(event) => { const template = templates.find((item) => item.id === event.target.value); if (template) setForm((current) => ({ ...current, title: template.title, message: template.message, type: template.type })) }}><option value="">Start from scratch</option>{templates.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="space-y-1.5 sm:col-span-2"><span className="text-xs font-bold text-slate-700">Title</span><input className={fieldClass} value={form.title} maxLength={80} onChange={(event) => update('title', event.target.value)} placeholder="Enter a clear notification title" /></label><label className="space-y-1.5 sm:col-span-2"><span className="flex justify-between text-xs font-bold text-slate-700"><span>Message</span><span className="font-medium text-slate-400">{form.message.length}/320</span></span><textarea className={`${fieldClass} min-h-32 resize-y`} value={form.message} maxLength={320} onChange={(event) => update('message', event.target.value)} placeholder="Write the notification message" /></label><label className="space-y-1.5"><span className="text-xs font-bold text-slate-700">Notification type</span><select className={fieldClass} value={form.type} onChange={(event) => update('type', event.target.value)}>{NOTIFICATION_TYPES.map((item) => <option key={item}>{item}</option>)}</select></label><label className="space-y-1.5"><span className="text-xs font-bold text-slate-700">Audience</span><select className={fieldClass} value={form.audience} onChange={(event) => setForm((current) => ({ ...current, audience: event.target.value, selectedRecipients: [] }))}>{NOTIFICATION_AUDIENCES.map((item) => <option key={item}>{item}</option>)}</select></label></div>{options.length > 0 && <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><label className="relative block"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input className={`${fieldClass} pl-9`} value={recipientQuery} onChange={(event) => setRecipientQuery(event.target.value)} placeholder="Search by name or email" /></label><div className="mt-2 max-h-44 space-y-1 overflow-y-auto">{visibleOptions.map((item) => <label key={item.id} className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-white"><input type="checkbox" className="accent-red-600" checked={form.selectedRecipients.includes(item.id)} onChange={() => update('selectedRecipients', form.selectedRecipients.includes(item.id) ? form.selectedRecipients.filter((id) => id !== item.id) : [...form.selectedRecipients, item.id])} /><span><span className="block text-xs font-semibold text-slate-800">{item.name}</span><span className="block text-[11px] text-slate-400">{item.detail}</span></span></label>)}</div></div>}<div><p className="text-xs font-bold text-slate-700">Delivery channels</p><div className="mt-2 grid gap-2 sm:grid-cols-3">{NOTIFICATION_CHANNELS.map((channel) => { const Icon = channel === 'Email' ? Mail : channel === 'SMS' ? Smartphone : MessageSquareText; const selected = form.channels.includes(channel); return <button key={channel} type="button" onClick={() => toggleChannel(channel)} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-3 text-xs font-bold transition ${selected ? 'border-brand bg-brand-light text-brand' : 'border-slate-200 text-slate-600 hover:border-brand/30'}`}><Icon className="size-4" />{channel}</button> })}</div></div><div><p className="text-xs font-bold text-slate-700">Schedule</p><div className="mt-2 grid gap-2 sm:grid-cols-2">{[['now', 'Send immediately', Send], ['later', 'Schedule for later', CalendarClock]].map(([key, label, Icon]) => <button key={key} type="button" onClick={() => update('timing', key)} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-3 text-xs font-bold ${form.timing === key ? 'border-brand bg-brand-light text-brand' : 'border-slate-200 text-slate-600'}`}><Icon className="size-4" />{label}</button>)}</div>{form.timing === 'later' && <input type="datetime-local" className={`${fieldClass} mt-3`} value={form.scheduledAt} onChange={(event) => update('scheduledAt', event.target.value)} />}</div><div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">{onCancel && <button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700">Cancel</button>}<button type="submit" className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(199,59,45,0.22)] hover:bg-brand-hover"><Send className="size-4" />{form.timing === 'later' ? 'Schedule notification' : 'Review and send'}</button></div></div><aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.035)]"><p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Live preview</p><div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-start gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand text-white"><Bell className="size-4" /></span><div><p className="text-sm font-bold text-slate-900">{form.title || 'Notification title'}</p><p className="mt-1 text-xs leading-relaxed text-slate-600">{form.message || 'Your notification message will appear here.'}</p><p className="mt-3 text-[10px] font-semibold text-slate-400">Just now · EZMall</p></div></div></div><dl className="mt-4 space-y-3 text-xs">{[['Audience', form.audience], ['Channels', form.channels.join(', ') || 'None'], ['Delivery', form.timing === 'now' ? 'Immediately' : 'Scheduled']].map(([label, value]) => <div key={label} className="flex justify-between gap-4"><dt className="text-slate-500">{label}</dt><dd className="text-right font-semibold text-slate-800">{value}</dd></div>)}</dl></aside></form>
}

function Templates({ templates, onUse, onDelete }) {
  if (templates.length === 0) {
    return <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-[0_14px_40px_rgba(15,23,42,0.035)]"><span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-brand-light text-brand"><FileText className="size-5" /></span><h3 className="mt-4 text-base font-bold text-slate-900">No notification templates yet</h3><p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">Templates created by the notification team will appear here and can be reused when composing a message.</p></div>
  }

  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{templates.map((template) => <article key={template.id} className="flex min-h-56 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.035)]"><div className="flex justify-between"><span className="flex size-10 items-center justify-center rounded-xl bg-brand-light text-brand"><FileText className="size-4" /></span><button type="button" onClick={() => onDelete(template)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="size-4" /></button></div><p className="mt-4 text-sm font-bold text-slate-900">{template.name}</p><p className="mt-1 text-xs font-semibold text-brand">{template.type}</p><p className="mt-3 line-clamp-3 text-xs leading-relaxed text-slate-500">{template.message}</p><button type="button" onClick={() => onUse(template)} className="mt-auto pt-4 text-left text-xs font-bold text-brand">Use template →</button></article>)}</div>
}

export function LegacyNotificationManagementWorkspace() {
  const [activeTab, setActiveTab] = useState('all')
  const [notifications, setNotifications] = useState(INITIAL_MANAGED_NOTIFICATIONS)
  const [templates, setTemplates] = useState(INITIAL_NOTIFICATION_TEMPLATES)
  const [query, setQuery] = useState(''); const [type, setType] = useState(''); const [status, setStatus] = useState(''); const [dateFrom, setDateFrom] = useState(''); const [dateTo, setDateTo] = useState('')
  const [selected, setSelected] = useState(null); const [editing, setEditing] = useState(null); const [pendingForm, setPendingForm] = useState(null); const [cancelItem, setCancelItem] = useState(null)
  const filtered = useMemo(() => notifications.filter((item) => { const haystack = `${item.title} ${item.message} ${item.audience}`.toLowerCase(); return (!query || haystack.includes(query.toLowerCase())) && (!type || item.type === type) && (!status || item.status === status) && (!dateFrom || new Date(item.date) >= new Date(dateFrom)) && (!dateTo || new Date(item.date) <= new Date(`${dateTo}T23:59:59`)) }), [notifications, query, type, status, dateFrom, dateTo])
  const recipientCount = (form) => form.audience.startsWith('Specific') ? form.selectedRecipients.length : form.audience === 'All Vendors' ? 86 : form.audience === 'All Customers' ? 1248 : 3890
  const saveForm = (form) => { if (editing?.id) { setNotifications((items) => items.map((item) => item.id === editing.id ? { ...item, ...form, status: 'Scheduled', recipients: recipientCount(form), date: form.scheduledAt } : item)); setEditing(null); setActiveTab('scheduled'); notify.success('Scheduled notification updated'); return } setPendingForm(form) }
  const confirmSend = () => { const form = pendingForm; const scheduled = form.timing === 'later'; setNotifications((items) => [{ id: `NTF-${Date.now().toString().slice(-5)}`, ...form, recipients: recipientCount(form), status: scheduled ? 'Scheduled' : 'Delivered', date: scheduled ? form.scheduledAt : new Date().toISOString(), deliveredRate: scheduled ? 0 : 100 }, ...items]); setPendingForm(null); setActiveTab(scheduled ? 'scheduled' : 'all'); notify.success(scheduled ? 'Notification scheduled' : 'Notification sent successfully') }
  const action = (key, item) => { if (key === 'view') setSelected(item); if (key === 'duplicate') { setEditing({ ...item, id: null, title: `${item.title} (copy)`, timing: 'now', scheduledAt: '' }); setActiveTab('create') } if (key === 'edit') { setEditing({ ...item, timing: 'later', scheduledAt: item.date, selectedRecipients: [] }); setActiveTab('create') } if (key === 'cancel') setCancelItem(item); if (key === 'resend') { setNotifications((items) => items.map((row) => row.id === item.id ? { ...row, status: 'Delivered', date: new Date().toISOString(), deliveredRate: 100 } : row)); notify.success('Notification resent successfully') } }
  const filters = <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.035)]"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_180px_180px_160px_160px_auto]"><label className="relative"><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input className={`${fieldClass} pl-10`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, message, or recipient" /></label><select className={fieldClass} value={type} onChange={(event) => setType(event.target.value)}><option value="">All types</option>{NOTIFICATION_TYPES.map((item) => <option key={item}>{item}</option>)}</select><select className={fieldClass} value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option>{['Delivered', 'Scheduled', 'Failed', 'Cancelled'].map((item) => <option key={item}>{item}</option>)}</select><input type="date" className={fieldClass} value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} aria-label="From date" /><input type="date" className={fieldClass} value={dateTo} onChange={(event) => setDateTo(event.target.value)} aria-label="To date" /><button type="button" onClick={() => { setQuery(''); setType(''); setStatus(''); setDateFrom(''); setDateTo('') }} className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-600">Clear</button></div></section>
  return <><nav className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_14px_40px_rgba(15,23,42,0.035)]"><div className="flex min-w-max gap-1">{NOTIFICATION_TABS.map((tab) => <button key={tab.key} type="button" onClick={() => { setActiveTab(tab.key); if (tab.key !== 'create') setEditing(null) }} className={`cursor-pointer rounded-xl px-4 py-2.5 text-xs font-bold ${activeTab === tab.key ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>{tab.label}{tab.key === 'scheduled' && <span className="ml-2 opacity-70">{notifications.filter((item) => item.status === 'Scheduled').length}</span>}</button>)}</div></nav>{activeTab === 'all' && <div className="space-y-4"><SummaryCards notifications={notifications} onSelect={(value) => setStatus(value === 'all' ? '' : value)} />{filters}<section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><NotificationTable items={filtered} onAction={action} /></section></div>}{activeTab === 'scheduled' && <div className="space-y-4">{filters}<section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-5 py-4"><h3 className="font-bold text-slate-900">Scheduled notifications</h3><p className="mt-1 text-xs text-slate-500">Edit, reschedule, or cancel messages that have not been sent.</p></div><NotificationTable items={filtered.filter((item) => item.status === 'Scheduled')} onAction={action} emptyTitle="No scheduled notifications" /></section></div>}{activeTab === 'create' && <Composer key={editing?.id ?? editing?.title ?? 'new'} initialValue={editing} templates={templates} onSubmit={saveForm} onCancel={editing ? () => { setEditing(null); setActiveTab('scheduled') } : null} />}{activeTab === 'templates' && <Templates templates={templates} onUse={(template) => { setEditing({ title: template.title, message: template.message, type: template.type, timing: 'now', audience: 'All Users', selectedRecipients: [], channels: ['In-App'] }); setActiveTab('create') }} onDelete={(template) => { setTemplates((items) => items.filter((item) => item.id !== template.id)); notify.success(`${template.name} removed`) }} />}
  <SlideDrawer open={Boolean(selected)} onClose={() => setSelected(null)} labelledBy="notification-detail-title" title="Notification details" subtitle={selected?.id} icon={Bell} widthClass="max-w-lg">{selected && <div className="space-y-5"><div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex justify-between gap-3"><StatusBadge status={selected.status} /><span className="text-xs font-semibold text-slate-400">{formatDate(selected.date)}</span></div><h3 className="mt-4 text-lg font-bold text-slate-950">{selected.title}</h3><p className="mt-2 text-sm leading-relaxed text-slate-600">{selected.message}</p></div><dl className="grid gap-3 sm:grid-cols-2">{[['Audience', selected.audience], ['Recipients', selected.recipients.toLocaleString()], ['Type', selected.type], ['Channels', selected.channels.join(', ')], ['Delivery rate', `${selected.deliveredRate}%`], ['Status', selected.status]].map(([label, value]) => <div key={label} className="rounded-xl border border-slate-200 bg-white p-4"><dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</dt><dd className="mt-1 text-sm font-semibold text-slate-800">{value}</dd></div>)}</dl></div>}</SlideDrawer>
  <ConfirmModal open={Boolean(pendingForm)} onClose={() => setPendingForm(null)} onConfirm={confirmSend} tone="brand" title={pendingForm?.timing === 'later' ? 'Schedule this notification?' : 'Send this notification now?'} description={pendingForm ? `This will ${pendingForm.timing === 'later' ? 'schedule a message for' : 'send a message to'} ${recipientCount(pendingForm).toLocaleString()} recipients through ${pendingForm.channels.join(', ')}.` : ''} confirmLabel={pendingForm?.timing === 'later' ? 'Schedule notification' : 'Send notification'} />
  <ConfirmModal open={Boolean(cancelItem)} onClose={() => setCancelItem(null)} onConfirm={() => { setNotifications((items) => items.map((item) => item.id === cancelItem.id ? { ...item, status: 'Cancelled' } : item)); setCancelItem(null); notify.success('Scheduled notification cancelled') }} title="Cancel scheduled notification?" description="This notification will not be sent. You can duplicate it later if needed." confirmLabel="Cancel notification" />
  </>
}

function LiveSummaryCards({ stats, notifications, onSelect }) {
  const fallback = {
    total: notifications.length,
    sent: notifications.filter((item) => item.status === 'Sent').length,
    scheduled: notifications.filter((item) => item.status === 'Scheduled').length,
    failed: notifications.filter((item) => item.status === 'Failed').length,
  }
  const values = stats ?? fallback
  const rows = [
    ['', 'Total notifications', values.total, 'All campaigns', Bell, 'bg-slate-50 text-slate-700 ring-slate-200'],
    ['sent', 'Sent', values.sent, 'Delivered campaigns', CheckCircle2, 'bg-emerald-50 text-emerald-700 ring-emerald-200'],
    ['scheduled', 'Scheduled', values.scheduled, 'Awaiting send', CalendarClock, 'bg-amber-50 text-amber-700 ring-amber-200'],
    ['failed', 'Failed', values.failed, 'Need attention', XCircle, 'bg-rose-50 text-rose-700 ring-rose-200'],
  ]
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{rows.map(([key, label, value, helper, Icon, tone]) => <button key={label} type="button" onClick={() => onSelect(key)} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-[0_10px_30px_rgba(15,23,42,0.035)] transition hover:-translate-y-0.5 hover:border-brand/30"><span className={`flex size-11 items-center justify-center rounded-xl ring-1 ring-inset ${tone}`}><Icon className="size-4.5" /></span><span><span className="block text-xs font-semibold text-slate-600">{label}</span><span className="block text-2xl font-bold text-slate-950">{value ?? 0}</span><span className="block text-[11px] text-slate-400">{helper}</span></span></button>)}</div>
}

export default function NotificationManagementWorkspace() {
  const [activeTab, setActiveTab] = useState('all')
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')
  const [type, setType] = useState('')
  const [status, setStatus] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(null)
  const [pendingForm, setPendingForm] = useState(null)
  const [cancelItem, setCancelItem] = useState(null)

  const filters = { search: query, type, status: activeTab === 'scheduled' ? 'scheduled' : status, dateFrom, dateTo, page, perPage: 20 }
  const listQuery = useManagedNotifications(filters)
  const statsQuery = useManagedNotificationStats()
  const templatesQuery = useManagedNotificationTemplates()
  const createMutation = useCreateManagedNotification()
  const updateMutation = useUpdateManagedNotification()
  const rescheduleMutation = useRescheduleManagedNotification()
  const cancelMutation = useCancelManagedNotification()
  const resendMutation = useResendManagedNotification()
  const deleteTemplateMutation = useDeleteNotificationTemplate()
  const customerQuery = useAdminUserRoster({}, 1)
  const vendorQuery = useAdminVendors('')

  const notifications = listQuery.data?.notifications ?? []
  const pagination = listQuery.data?.pagination ?? { page: 1, lastPage: 1, total: 0 }
  const templates = templatesQuery.data ?? []
  const audienceOptions = useMemo(() => ({
    'Specific Customers': customerQuery.users.map((user) => ({ id: user.id, name: user.name, detail: user.email })),
    'Specific Vendors': (vendorQuery.data ?? []).map((vendor) => ({ id: vendor.id, name: vendor.store, detail: vendor.email })),
  }), [customerQuery.users, vendorQuery.data])

  const clearFilters = () => {
    setQuery(''); setType(''); setStatus(''); setDateFrom(''); setDateTo(''); setPage(1)
  }

  const saveForm = (form) => {
    if (editing?.id) {
      setPendingForm({ ...form, id: editing.id, previousDate: editing.date, mode: 'update' })
      return
    }
    setPendingForm({ ...form, mode: 'create' })
  }

  const confirmSubmit = async () => {
    const form = pendingForm
    if (!form) return
    try {
      if (form.mode === 'update') {
        await updateMutation.mutateAsync({ id: form.id, form })
        if (form.timing === 'later' && form.scheduledAt && form.scheduledAt !== form.previousDate) {
          await rescheduleMutation.mutateAsync({ id: form.id, scheduledAt: form.scheduledAt })
        }
      } else {
        await createMutation.mutateAsync(form)
      }
      setPendingForm(null)
      setEditing(null)
      setActiveTab(form.timing === 'later' ? 'scheduled' : 'all')
    } catch {
      // Mutation hooks display the API error and keep the confirmation open for retry.
    }
  }

  const action = (key, item) => {
    if (key === 'view') setSelected(item)
    if (key === 'duplicate') {
      setEditing({ ...item, id: null, title: `${item.title} (copy)`, timing: 'now', scheduledAt: '', selectedRecipients: [] })
      setActiveTab('create')
    }
    if (key === 'edit') {
      setEditing({ ...item, timing: 'later', scheduledAt: item.date?.slice(0, 16), selectedRecipients: [] })
      setActiveTab('create')
    }
    if (key === 'cancel') setCancelItem(item)
    if (key === 'resend') resendMutation.mutate(item.id)
  }

  const filterPanel = <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.035)]"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_180px_180px_160px_160px_auto]"><label className="relative"><Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" /><input className={`${fieldClass} pl-10`} value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} placeholder="Search title, message, or recipient" /></label><select className={fieldClass} value={type} onChange={(event) => { setType(event.target.value); setPage(1) }}><option value="">All types</option>{NOTIFICATION_TYPES.map((item) => <option key={item}>{item}</option>)}</select><select className={fieldClass} value={status} disabled={activeTab === 'scheduled'} onChange={(event) => { setStatus(event.target.value); setPage(1) }}><option value="">All statuses</option>{['Draft', 'Scheduled', 'Sending', 'Sent', 'Failed', 'Cancelled'].map((item) => <option key={item}>{item}</option>)}</select><input type="date" className={fieldClass} value={dateFrom} onChange={(event) => { setDateFrom(event.target.value); setPage(1) }} aria-label="From date" /><input type="date" className={fieldClass} value={dateTo} onChange={(event) => { setDateTo(event.target.value); setPage(1) }} aria-label="To date" /><button type="button" onClick={clearFilters} className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-600">Clear</button></div></section>

  if (listQuery.isError) return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center"><h3 className="font-bold text-rose-900">Notifications could not be loaded</h3><p className="mt-2 text-sm text-rose-700">{listQuery.error?.message}</p><button type="button" onClick={() => listQuery.refetch()} className="mt-4 rounded-xl bg-brand px-4 py-2 text-sm font-bold text-white">Try again</button></div>

  return <>
    <nav className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_14px_40px_rgba(15,23,42,0.035)]"><div className="flex min-w-max gap-1">{NOTIFICATION_TABS.map((tab) => <button key={tab.key} type="button" onClick={() => { setActiveTab(tab.key); setPage(1); if (tab.key !== 'create') setEditing(null) }} className={`cursor-pointer rounded-xl px-4 py-2.5 text-xs font-bold ${activeTab === tab.key ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>{tab.label}{tab.key === 'scheduled' && <span className="ml-2 opacity-70">{statsQuery.data?.scheduled ?? 0}</span>}</button>)}</div></nav>
    {activeTab === 'all' && <div className="space-y-4"><LiveSummaryCards stats={statsQuery.data} notifications={notifications} onSelect={(value) => { setStatus(value); setPage(1) }} />{filterPanel}<section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">{listQuery.isLoading ? <div className="p-12 text-center text-sm text-slate-500">Loading notifications…</div> : <NotificationTable items={notifications} onAction={action} />}</section></div>}
    {activeTab === 'scheduled' && <div className="space-y-4">{filterPanel}<section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-5 py-4"><h3 className="font-bold text-slate-900">Scheduled notifications</h3><p className="mt-1 text-xs text-slate-500">Edit, reschedule, or cancel messages that have not been sent.</p></div><NotificationTable items={notifications} onAction={action} emptyTitle="No scheduled notifications" /></section></div>}
    {(activeTab === 'all' || activeTab === 'scheduled') && pagination.lastPage > 1 && <div className="flex items-center justify-end gap-3"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold disabled:opacity-40">Previous</button><span className="text-xs text-slate-500">Page {pagination.page} of {pagination.lastPage}</span><button type="button" disabled={page >= pagination.lastPage} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold disabled:opacity-40">Next</button></div>}
    {activeTab === 'create' && <Composer key={editing?.id ?? editing?.title ?? 'new'} initialValue={editing} templates={templates} audienceOptions={audienceOptions} onSubmit={saveForm} onCancel={editing ? () => { setEditing(null); setActiveTab('scheduled') } : null} />}
    {activeTab === 'templates' && (templatesQuery.isLoading ? <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">Loading templates…</div> : <Templates templates={templates} onUse={(template) => { setEditing({ ...template, id: null, timing: 'now', scheduledAt: '', selectedRecipients: [] }); setActiveTab('create') }} onDelete={(template) => deleteTemplateMutation.mutate(template.id)} />)}
    <SlideDrawer open={Boolean(selected)} onClose={() => setSelected(null)} labelledBy="notification-detail-title" title="Notification details" subtitle={selected?.id} icon={Bell} widthClass="max-w-lg">{selected && <div className="space-y-5"><div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex justify-between gap-3"><StatusBadge status={selected.status} /><span className="text-xs font-semibold text-slate-400">{formatDate(selected.date)}</span></div><h3 className="mt-4 text-lg font-bold text-slate-950">{selected.title}</h3><p className="mt-2 text-sm leading-relaxed text-slate-600">{selected.message}</p></div><dl className="grid gap-3 sm:grid-cols-2">{[['Audience', selected.audience], ['Recipients', selected.recipients.toLocaleString()], ['Type', selected.type], ['Channels', selected.channels.join(', ') || '—'], ['Delivery rate', `${Math.round(selected.deliveredRate)}%`], ['Status', selected.status]].map(([label, value]) => <div key={label} className="rounded-xl border border-slate-200 bg-white p-4"><dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</dt><dd className="mt-1 text-sm font-semibold text-slate-800">{value}</dd></div>)}</dl></div>}</SlideDrawer>
    <ConfirmModal open={Boolean(pendingForm)} onClose={() => setPendingForm(null)} onConfirm={confirmSubmit} tone="brand" title={pendingForm?.timing === 'later' ? 'Schedule this notification?' : 'Send this notification now?'} description={pendingForm ? `This will ${pendingForm.mode === 'update' ? 'update' : pendingForm.timing === 'later' ? 'schedule' : 'send'} the notification through ${pendingForm.channels.join(', ')}.` : ''} confirmLabel={pendingForm?.timing === 'later' ? 'Schedule notification' : 'Send notification'} loading={createMutation.isPending || updateMutation.isPending || rescheduleMutation.isPending} />
    <ConfirmModal open={Boolean(cancelItem)} onClose={() => setCancelItem(null)} onConfirm={async () => { try { await cancelMutation.mutateAsync(cancelItem.id); setCancelItem(null) } catch { /* hook reports error */ } }} title="Cancel scheduled notification?" description="This notification will not be sent. You can duplicate it later if needed." confirmLabel="Cancel notification" loading={cancelMutation.isPending} />
  </>
}
