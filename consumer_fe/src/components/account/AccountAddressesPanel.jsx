import { useMemo, useState } from 'react'
import { Check, Loader2, MapPin, Pencil, Plus, Trash2 } from 'lucide-react'
import AddressFormDrawer from './AddressFormDrawer'
import { useUserAddressMutations } from '../../hooks/useUserAddressMutations'
import { LOCATION_OTHER_VALUE } from '../../constants/ghanaLocations'
import {
  addressGroups,
  addressId,
  emptyAddressForm,
  toAddressForm,
} from '../../utils/userAddressHelpers'

function AddressCard({ address, type, pendingId, onEdit, onDelete }) {
  const id = addressId(address)
  const deleting = pendingId === id
  const recipient = [address?.first_name, address?.last_name].filter(Boolean).join(' ') || address?.name || 'Saved address'
  const city = address?.city_or_town ?? address?.city ?? address?.town
  const isDefault = Boolean(address?.is_default ?? address?.isDefault)

  return (
    <article className="relative min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_25px_rgba(15,23,42,0.04)] transition-all hover:border-auth-primary/25 hover:shadow-md sm:p-5">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-auth-primary">
          <MapPin className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="wrap-break-word font-bold text-slate-950">{recipient}</h3>
            {isDefault ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[0.65rem] font-bold uppercase text-emerald-700">
                <Check className="size-3" />
                Default
              </span>
            ) : null}
          </div>
          <p className="mt-2 wrap-break-word text-sm leading-6 text-slate-600">
            {address?.address_line_1 ?? address?.address ?? 'Street address not provided'}
          </p>
          <p className="mt-1 wrap-break-word text-xs font-medium text-slate-500">
            {[city, address?.region, address?.country].filter(Boolean).join(', ')}
          </p>
          <p className="mt-2 text-xs font-semibold text-slate-700">
            {address?.phone_number ?? address?.phone ?? 'No phone number'}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={() => onEdit(address, type)}
          disabled={deleting}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:border-auth-primary/30 hover:text-auth-primary disabled:opacity-50"
        >
          <Pencil className="size-3.5" />
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(address, type)}
          disabled={deleting}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-60"
        >
          {deleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </article>
  )
}

export default function AccountAddressesPanel({ data, isLoading }) {
  const groups = useMemo(() => addressGroups(data), [data])
  const [form, setForm] = useState(emptyAddressForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyAddressForm)
  }

  const { saveMutation, deleteMutation, submitAddressForm } = useUserAddressMutations({
    onSaved: closeForm,
  })

  const openCreate = (type) => {
    setForm({ ...emptyAddressForm, type })
    setEditingId(null)
    setShowForm(true)
  }

  const openEdit = (address, type) => {
    setForm(toAddressForm(address, type))
    setEditingId(addressId(address))
    setShowForm(true)
  }

  const remove = (address) => {
    const id = addressId(address)
    if (id && window.confirm('Delete this saved address? This action cannot be undone.')) {
      setPendingDeleteId(id)
      deleteMutation.mutate(id, {
        onSettled: () => setPendingDeleteId(null),
      })
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    submitAddressForm(form, editingId)
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 rounded-2xl bg-linear-to-br from-[#b92f23] to-auth-primary p-5 text-white shadow-lg sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div>
          <p className="text-sm font-semibold text-white/70">Address book</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Your saved addresses</h1>
          <p className="mt-2 max-w-xl text-sm text-white/75">Manage the delivery and billing locations used during checkout.</p>
        </div>
        <button
          type="button"
          onClick={() => openCreate('shipping')}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-auth-primary"
        >
          <Plus className="size-4" />
          Add address
        </button>
      </div>

      {isLoading ? (
        <div className="flex min-h-64 items-center justify-center rounded-2xl bg-white">
          <Loader2 className="size-7 animate-spin text-auth-primary" />
        </div>
      ) : (
        ['shipping', 'billing'].map((type) => (
          <section key={type} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-auth-primary">
                  {type === 'shipping' ? 'Delivery' : 'Payments'}
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  {type === 'shipping' ? 'Delivery addresses' : 'Billing addresses'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => openCreate(type)}
                className="inline-flex items-center gap-2 text-sm font-bold text-auth-primary"
              >
                <Plus className="size-4" />
                Add {type === 'billing' ? 'billing' : 'delivery'} address
              </button>
            </div>
            {groups[type].length ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {groups[type].map((address) => (
                  <AddressCard
                    key={addressId(address)}
                    address={address}
                    type={type}
                    pendingId={pendingDeleteId}
                    onEdit={openEdit}
                    onDelete={remove}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-slate-300 px-5 py-10 text-center">
                <MapPin className="mx-auto size-7 text-slate-300" />
                <p className="mt-3 text-sm font-semibold text-slate-700">No {type} addresses saved</p>
              </div>
            )}
          </section>
        ))
      )}

      {showForm ? (
        <AddressFormDrawer
          isOpen={showForm}
          form={form}
          editingId={editingId}
          isSaving={saveMutation.isPending}
          onChange={(event) => {
            const { name, value, type: inputType, checked } = event.target
            setForm((current) => ({ ...current, [name]: inputType === 'checkbox' ? checked : value }))
          }}
          onRegionChange={(region) => setForm((current) => ({ ...current, region, city_or_town: '', town_custom: '' }))}
          onTownChange={(city_or_town) => setForm((current) => ({
            ...current,
            city_or_town,
            town_custom: city_or_town === LOCATION_OTHER_VALUE ? current.town_custom : '',
          }))}
          onTownCustomChange={(town_custom) => setForm((current) => ({ ...current, town_custom }))}
          onClose={closeForm}
          onSubmit={handleSubmit}
        />
      ) : null}
    </section>
  )
}
