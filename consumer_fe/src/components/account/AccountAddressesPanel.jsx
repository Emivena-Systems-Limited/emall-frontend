import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Building2, Check, Loader2, MapPin, Pencil, Plus, Trash2, X } from 'lucide-react'
import { createUserAddress, deleteUserAddress, updateUserAddress } from '../../services/addressService'
import { notify } from '../../lib/notify'
import SearchableSelect from '../auth/SearchableSelect'
import {
  GHANA_LOCATIONS,
  LOCATION_OTHER_VALUE,
  getCityLabel,
  getCityOptionsByRegion,
} from '../../constants/ghanaLocations'

const regionOptions = GHANA_LOCATIONS.map((region) => ({ value: region.id, label: region.name }))

const emptyForm = {
  type: 'shipping', first_name: '', last_name: '', phone_number: '', region: '',
  city_or_town: '', town_custom: '', address_line_1: '', landmark: '', delivery_note: '', country: 'Ghana', is_default: false,
}

function resolveRegionId(value) {
  const raw = String(value ?? '').trim()
  return GHANA_LOCATIONS.find((region) => region.id === raw || region.name.toLowerCase() === raw.toLowerCase())?.id ?? ''
}

function resolveTown(regionId, value) {
  const raw = String(value ?? '').trim()
  const match = getCityOptionsByRegion(regionId).find((option) => option.value === raw || option.label.toLowerCase() === raw.toLowerCase())
  return match ? { city_or_town: match.value, town_custom: '' } : { city_or_town: raw ? LOCATION_OTHER_VALUE : '', town_custom: raw }
}

function addressId(address) {
  return address?.id ?? address?.address_id ?? null
}

function addressGroups(response) {
  const data = response?.data ?? response ?? {}
  if (Array.isArray(data)) {
    return {
      shipping: data.filter((item) => item?.type !== 'billing'),
      billing: data.filter((item) => item?.type === 'billing'),
    }
  }
  return {
    shipping: Array.isArray(data.shipping) ? data.shipping : [],
    billing: Array.isArray(data.billing) ? data.billing : [],
  }
}

function toForm(address, type) {
  const region = resolveRegionId(address?.region)
  const town = resolveTown(region, address?.city_or_town ?? address?.city ?? address?.town)
  return {
    ...emptyForm,
    type,
    first_name: address?.first_name ?? '',
    last_name: address?.last_name ?? '',
    phone_number: address?.phone_number ?? address?.phone ?? '',
    region,
    ...town,
    address_line_1: address?.address_line_1 ?? address?.address ?? '',
    landmark: typeof address?.landmark === 'string' ? address.landmark : '',
    delivery_note: typeof address?.delivery_note === 'string' ? address.delivery_note : '',
    country: typeof address?.country === 'string' ? address.country : 'Ghana',
    is_default: Boolean(address?.is_default ?? address?.isDefault),
  }
}

function AddressCard({ address, type, pendingId, onEdit, onDelete }) {
  const id = addressId(address)
  const deleting = pendingId === id
  const recipient = [address?.first_name, address?.last_name].filter(Boolean).join(' ') || address?.name || 'Saved address'
  const city = address?.city_or_town ?? address?.city ?? address?.town
  const isDefault = Boolean(address?.is_default ?? address?.isDefault)

  return (
    <article className="relative min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_25px_rgba(15,23,42,0.04)] transition-all hover:border-auth-primary/25 hover:shadow-md sm:p-5">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-auth-primary"><MapPin className="size-5" /></span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="break-words font-bold text-slate-950">{recipient}</h3>
            {isDefault ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[0.65rem] font-bold uppercase text-emerald-700"><Check className="size-3" />Default</span> : null}
          </div>
          <p className="mt-2 break-words text-sm leading-6 text-slate-600">{address?.address_line_1 ?? address?.address ?? 'Street address not provided'}</p>
          <p className="mt-1 break-words text-xs font-medium text-slate-500">{[city, address?.region, address?.country].filter(Boolean).join(', ')}</p>
          <p className="mt-2 text-xs font-semibold text-slate-700">{address?.phone_number ?? address?.phone ?? 'No phone number'}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3">
        <button type="button" onClick={() => onEdit(address, type)} disabled={deleting} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:border-auth-primary/30 hover:text-auth-primary disabled:opacity-50"><Pencil className="size-3.5" />Edit</button>
        <button type="button" onClick={() => onDelete(address, type)} disabled={deleting} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-60">{deleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}{deleting ? 'Deleting…' : 'Delete'}</button>
      </div>
    </article>
  )
}

function AddressFormModal({ form, editingId, isSaving, onChange, onRegionChange, onTownChange, onTownCustomChange, onClose, onSubmit }) {
  const townOptions = useMemo(() => getCityOptionsByRegion(form.region), [form.region])
  const fields = [
    ['first_name', 'First name'], ['last_name', 'Last name'], ['phone_number', 'Phone number'],
    ['address_line_1', 'Street address'], ['landmark', 'Landmark (optional)'], ['delivery_note', 'Delivery note (optional)'],
  ]
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-5" role="dialog" aria-modal="true" aria-label={editingId ? 'Edit address' : 'Add address'}>
      <form onSubmit={onSubmit} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-auth-primary">Address book</p><h2 className="mt-1 text-2xl font-bold text-slate-950">{editingId ? 'Edit address' : 'Add a new address'}</h2></div><button type="button" onClick={onClose} className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500"><X className="size-4" /></button></div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-slate-700"><span>Address type</span><select name="type" value={form.type} onChange={onChange} disabled={Boolean(editingId)} className="h-12 rounded-xl border border-slate-300 bg-white px-4 font-normal outline-none focus:border-auth-primary"><option value="shipping">Delivery address</option><option value="billing">Billing address</option></select></label>
          {fields.map(([name, label]) => <label key={name} className={`grid gap-2 text-sm font-semibold text-slate-700 ${name === 'address_line_1' || name === 'delivery_note' ? 'sm:col-span-2' : ''}`}><span>{label}{['first_name', 'last_name', 'phone_number', 'region', 'city_or_town', 'address_line_1'].includes(name) ? ' *' : ''}</span><input name={name} required={['first_name', 'last_name', 'phone_number', 'region', 'city_or_town', 'address_line_1'].includes(name)} value={form[name]} onChange={onChange} className="h-12 min-w-0 rounded-xl border border-slate-300 px-4 font-normal outline-none focus:border-auth-primary focus:ring-2 focus:ring-red-100" /></label>)}
          <SearchableSelect id="account-address-region" label="Region" icon={MapPin} value={form.region} onChange={onRegionChange} options={regionOptions} placeholder="Search regions…" emptyLabel="Select region" />
          <SearchableSelect id="account-address-town" label="City / Town" icon={Building2} value={form.city_or_town} onChange={onTownChange} options={townOptions} placeholder="Search towns…" emptyLabel="Select town" allowOther otherValue={LOCATION_OTHER_VALUE} otherLabel="Other (enter custom town)" customValue={form.town_custom} onCustomChange={onTownCustomChange} customInputPlaceholder="Type your town name" disabled={!form.region} />
          <label className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-700 sm:col-span-2"><input type="checkbox" name="is_default" checked={form.is_default} onChange={onChange} className="size-4 accent-auth-primary" />Make this my default {form.type === 'billing' ? 'billing' : 'delivery'} address</label>
        </div>
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700">Cancel</button><button type="submit" disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-auth-primary px-6 py-3 text-sm font-bold text-white disabled:opacity-60">{isSaving ? <Loader2 className="size-4 animate-spin" /> : null}{isSaving ? 'Saving…' : editingId ? 'Save changes' : 'Save address'}</button></div>
      </form>
    </div>
  )
}

export default function AccountAddressesPanel({ data, isLoading }) {
  const queryClient = useQueryClient()
  const groups = useMemo(() => addressGroups(data), [data])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['user-addresses'] })
  const saveMutation = useMutation({
    mutationFn: ({ id, payload }) => id ? updateUserAddress({ addressId: id, payload }) : createUserAddress(payload),
    onSuccess: async () => { await refresh(); setShowForm(false); setEditingId(null); setForm(emptyForm); notify.success(editingId ? 'Address updated' : 'Address added') },
    onError: (error) => notify.fromError(error, 'Unable to save address'),
  })
  const deleteMutation = useMutation({
    mutationFn: deleteUserAddress,
    onMutate: setPendingDeleteId,
    onSuccess: async () => { await refresh(); notify.success('Address deleted') },
    onError: (error) => notify.fromError(error, 'Unable to delete address'),
    onSettled: () => setPendingDeleteId(null),
  })
  const openCreate = (type) => { setForm({ ...emptyForm, type }); setEditingId(null); setShowForm(true) }
  const openEdit = (address, type) => { setForm(toForm(address, type)); setEditingId(addressId(address)); setShowForm(true) }
  const remove = (address) => { const id = addressId(address); if (id && window.confirm('Delete this saved address? This action cannot be undone.')) deleteMutation.mutate(id) }
  const submit = (event) => {
    event.preventDefault()
    if (!form.region || !form.city_or_town || (form.city_or_town === LOCATION_OTHER_VALUE && !form.town_custom.trim())) {
      notify.error('Please select a region and city or town')
      return
    }
    const region = GHANA_LOCATIONS.find((item) => item.id === form.region)?.name ?? form.region
    const city = form.city_or_town === LOCATION_OTHER_VALUE ? form.town_custom : getCityLabel(form.region, form.city_or_town)
    const { town_custom: _townCustom, ...formPayload } = form
    void _townCustom
    const payload = Object.fromEntries(
      Object.entries({ ...formPayload, region, city_or_town: city })
        .map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
        .filter(([key, value]) => !(['landmark', 'delivery_note'].includes(key) && value === '')),
    )
    saveMutation.mutate({ id: editingId, payload })
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-br from-[#b92f23] to-auth-primary p-5 text-white shadow-lg sm:flex-row sm:items-center sm:justify-between sm:p-7"><div><p className="text-sm font-semibold text-white/70">Address book</p><h1 className="mt-1 text-2xl font-bold sm:text-3xl">Your saved addresses</h1><p className="mt-2 max-w-xl text-sm text-white/75">Manage the delivery and billing locations used during checkout.</p></div><button type="button" onClick={() => openCreate('shipping')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-auth-primary"><Plus className="size-4" />Add address</button></div>
      {isLoading ? <div className="flex min-h-64 items-center justify-center rounded-2xl bg-white"><Loader2 className="size-7 animate-spin text-auth-primary" /></div> : ['shipping', 'billing'].map((type) => <section key={type} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-auth-primary">{type === 'shipping' ? 'Delivery' : 'Payments'}</p><h2 className="mt-1 text-xl font-bold text-slate-950">{type === 'shipping' ? 'Delivery addresses' : 'Billing addresses'}</h2></div><button type="button" onClick={() => openCreate(type)} className="inline-flex items-center gap-2 text-sm font-bold text-auth-primary"><Plus className="size-4" />Add {type === 'billing' ? 'billing' : 'delivery'} address</button></div>{groups[type].length ? <div className="mt-5 grid gap-4 md:grid-cols-2"><>{groups[type].map((address) => <AddressCard key={addressId(address)} address={address} type={type} pendingId={pendingDeleteId} onEdit={openEdit} onDelete={remove} />)}</></div> : <div className="mt-5 rounded-xl border border-dashed border-slate-300 px-5 py-10 text-center"><MapPin className="mx-auto size-7 text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-700">No {type} addresses saved</p></div>}</section>)}
      {showForm ? <AddressFormModal form={form} editingId={editingId} isSaving={saveMutation.isPending} onChange={(event) => { const { name, value, type, checked } = event.target; setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value })) }} onRegionChange={(region) => setForm((current) => ({ ...current, region, city_or_town: '', town_custom: '' }))} onTownChange={(city_or_town) => setForm((current) => ({ ...current, city_or_town, town_custom: city_or_town === LOCATION_OTHER_VALUE ? current.town_custom : '' }))} onTownCustomChange={(town_custom) => setForm((current) => ({ ...current, town_custom }))} onClose={() => setShowForm(false)} onSubmit={submit} /> : null}
    </section>
  )
}
