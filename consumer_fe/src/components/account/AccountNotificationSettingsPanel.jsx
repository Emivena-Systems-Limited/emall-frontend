import { useState } from 'react'
import { Link } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Bell, Check, LoaderCircle, Mail, MessageSquareText, ShieldCheck } from 'lucide-react'
import AccountSectionShell from './AccountSectionShell'
import { notify } from '../../lib/notify'
import { getNotificationPreferences, updateNotificationPreferences } from '../../services/notificationService'
import { notificationQueryKeys } from '../../hooks/useNotificationUnreadCount'

const titleCase = (value = '') => String(value).replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
const channelMeta = {
  in_app: { label: 'In-app', icon: Bell },
  email: { label: 'Email', icon: Mail },
  sms: { label: 'SMS', icon: MessageSquareText },
}

function normalize(payload) {
  const value = payload?.preferences ?? payload?.data?.preferences ?? payload?.data ?? payload ?? {}
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

function SettingsForm({ initialValue, saving, onSave }) {
  const [draft, setDraft] = useState(initialValue)
  const groups = Object.entries(draft).filter(([, channels]) => channels && typeof channels === 'object')

  if (!groups.length) return <div className="rounded-2xl border border-slate-200 px-6 py-14 text-center"><Bell className="mx-auto size-7 text-auth-primary" /><h3 className="mt-3 font-extrabold">No preferences available</h3><p className="mt-1 text-sm text-slate-500">Notification options will appear here when they become available.</p></div>

  return <>
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="hidden grid-cols-[minmax(12rem,1fr)_repeat(3,7rem)] border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 sm:grid"><span>Notification type</span>{['in_app', 'email', 'sms'].map((channel) => <span key={channel} className="text-center">{channelMeta[channel].label}</span>)}</div>
      {groups.map(([group, channels]) => <div key={group} className="border-b border-slate-100 p-5 last:border-0 sm:grid sm:grid-cols-[minmax(12rem,1fr)_repeat(3,7rem)] sm:items-center">
        <div><h3 className="text-sm font-extrabold text-slate-950">{titleCase(group)}</h3><p className="mt-1 text-xs text-slate-500">Manage {titleCase(group).toLowerCase()} alerts.</p></div>
        <div className="mt-4 grid grid-cols-3 gap-2 sm:contents">{['in_app', 'email', 'sms'].map((channel) => {
          const Icon = channelMeta[channel].icon
          const enabled = Boolean(channels[channel])
          return <label key={channel} className="flex cursor-pointer flex-col items-center gap-2 text-xs font-semibold text-slate-500 sm:py-1"><span className="sm:hidden"><Icon className="size-4" /></span><input type="checkbox" checked={enabled} onChange={(event) => setDraft((current) => ({ ...current, [group]: { ...current[group], [channel]: event.target.checked } }))} className="size-4 accent-auth-primary" /><span className="sm:hidden">{channelMeta[channel].label}</span></label>
        })}</div>
      </div>)}
    </div>
    <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="flex items-center gap-2 text-xs text-slate-500"><ShieldCheck className="size-4 text-emerald-600" />Security alerts may remain enabled when required to protect your account.</p><button type="button" disabled={saving} onClick={() => onSave(draft)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-auth-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-auth-primary-hover disabled:opacity-60">{saving ? <LoaderCircle className="size-4 animate-spin" /> : <Check className="size-4" />}{saving ? 'Saving…' : 'Save preferences'}</button></div>
  </>
}

export default function AccountNotificationSettingsPanel() {
  const client = useQueryClient()
  const query = useQuery({ queryKey: notificationQueryKeys.preferences, queryFn: getNotificationPreferences, retry: false })
  const save = useMutation({ mutationFn: updateNotificationPreferences, onSuccess: () => { notify.success('Notification preferences saved'); client.invalidateQueries({ queryKey: notificationQueryKeys.preferences }) }, onError: (error) => notify.error(error.message || 'Could not save preferences') })

  return <AccountSectionShell eyebrow="Preferences" title="Notification settings" description="Choose which updates you receive and where you receive them." icon={SettingsIcon}>
    <Link to="/account/notifications" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-auth-primary hover:underline"><ArrowLeft className="size-4" /> Back to notifications</Link>
    {query.isLoading ? <div className="flex min-h-72 items-center justify-center gap-2 text-sm text-slate-500"><LoaderCircle className="size-5 animate-spin" /> Loading preferences…</div> : query.isError ? <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center"><h3 className="font-extrabold text-red-800">Settings could not be loaded</h3><p className="mt-1 text-sm text-red-700">{query.error?.message || 'Please try again.'}</p><button type="button" onClick={() => query.refetch()} className="mt-4 rounded-xl bg-auth-primary px-4 py-2 text-xs font-bold text-white">Try again</button></div> : <SettingsForm key={JSON.stringify(query.data)} initialValue={normalize(query.data)} saving={save.isPending} onSave={(value) => save.mutate(value)} />}
  </AccountSectionShell>
}

function SettingsIcon(props) {
  return <Bell {...props} />
}
