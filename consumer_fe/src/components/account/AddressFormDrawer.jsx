import { useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Building2, Loader2, MapPin, X } from 'lucide-react'
import SearchableSelect from '../auth/SearchableSelect'
import {
  GHANA_LOCATIONS,
  LOCATION_OTHER_VALUE,
  getCityOptionsByRegion,
} from '../../constants/ghanaLocations'

const drawerEase = [0.16, 1, 0.3, 1]

const regionOptions = GHANA_LOCATIONS.map((region) => ({ value: region.id, label: region.name }))

const fields = [
  ['first_name', 'First name'],
  ['last_name', 'Last name'],
  ['phone_number', 'Phone number'],
  ['address_line_1', 'Street address'],
  ['landmark', 'Landmark (optional)'],
  ['delivery_note', 'Delivery note (optional)'],
]

const requiredFields = new Set([
  'first_name',
  'last_name',
  'phone_number',
  'region',
  'city_or_town',
  'address_line_1',
])

export default function AddressFormDrawer({
  isOpen,
  form,
  editingId,
  isSaving,
  onChange,
  onRegionChange,
  onTownChange,
  onTownCustomChange,
  onClose,
  onSubmit,
  allowTypeChange = true,
}) {
  const townOptions = useMemo(() => getCityOptionsByRegion(form.region), [form.region])
  const title = editingId ? 'Edit address' : 'Add a new address'

  useEffect(() => {
    if (!isOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isSaving) onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, isSaving, onClose])

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <div
          className="fixed inset-0 z-100"
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.button
            type="button"
            aria-label="Close address form"
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={isSaving ? undefined : onClose}
          />

          <motion.aside
            className="absolute inset-y-0 right-0 flex w-[min(100vw-0.75rem,28rem)] flex-col border-l border-slate-200/80 bg-white shadow-[-12px_0_40px_-16px_rgba(15,23,42,0.28)] sm:w-[min(100vw-2rem,32rem)]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.32, ease: drawerEase }}
          >
            <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200/80 px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-auth-primary">Address book</p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">{title}</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                aria-label="Close"
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 disabled:opacity-50"
              >
                <X className="size-4" />
              </button>
            </header>

            <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-semibold text-slate-700 sm:col-span-2">
                    <span>Address type</span>
                    <select
                      name="type"
                      value={form.type}
                      onChange={onChange}
                      disabled={Boolean(editingId) || !allowTypeChange}
                      className="h-12 rounded-xl border border-slate-300 bg-white px-4 font-normal outline-none focus:border-auth-primary disabled:bg-slate-50"
                    >
                      <option value="shipping">Delivery address</option>
                      <option value="billing">Billing address</option>
                    </select>
                  </label>

                  {fields.map(([name, label]) => (
                    <label
                      key={name}
                      className={`grid gap-2 text-sm font-semibold text-slate-700 ${
                        name === 'address_line_1' || name === 'delivery_note' ? 'sm:col-span-2' : ''
                      }`}
                    >
                      <span>
                        {label}
                        {requiredFields.has(name) ? ' *' : ''}
                      </span>
                      <input
                        name={name}
                        required={requiredFields.has(name)}
                        value={form[name]}
                        onChange={onChange}
                        className="h-12 min-w-0 rounded-xl border border-slate-300 px-4 font-normal outline-none focus:border-auth-primary focus:ring-2 focus:ring-red-100"
                      />
                    </label>
                  ))}

                  <SearchableSelect
                    id="account-address-region"
                    label="Region"
                    icon={MapPin}
                    value={form.region}
                    onChange={onRegionChange}
                    options={regionOptions}
                    placeholder="Search regions…"
                    emptyLabel="Select region"
                  />
                  <SearchableSelect
                    id="account-address-town"
                    label="City / Town"
                    icon={Building2}
                    value={form.city_or_town}
                    onChange={onTownChange}
                    options={townOptions}
                    placeholder="Search towns…"
                    emptyLabel="Select town"
                    allowOther
                    otherValue={LOCATION_OTHER_VALUE}
                    otherLabel="Other (enter custom town)"
                    customValue={form.town_custom}
                    onCustomChange={onTownCustomChange}
                    customInputPlaceholder="Type your town name"
                    disabled={!form.region}
                  />

                  <label className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-700 sm:col-span-2">
                    <input
                      type="checkbox"
                      name="is_default"
                      checked={form.is_default}
                      onChange={onChange}
                      className="size-4 accent-auth-primary"
                    />
                    Make this my default {form.type === 'billing' ? 'billing' : 'delivery'} address
                  </label>
                </div>
              </div>

              <footer className="shrink-0 border-t border-slate-200/80 bg-white px-5 py-4">
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSaving}
                    className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-auth-primary px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
                  >
                    {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
                    {isSaving ? 'Saving…' : editingId ? 'Save changes' : 'Save address'}
                  </button>
                </div>
              </footer>
            </form>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
