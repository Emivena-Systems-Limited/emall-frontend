import { useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, Save, X } from 'lucide-react'
import SearchableSelect from '../auth/SearchableSelect'
import {
  GHANA_LOCATIONS,
  LOCATION_OTHER_VALUE,
  getCityOptionsByRegion,
  getDistrictsByRegion,
} from '../../constants/ghanaLocations'

const drawerEase = [0.16, 1, 0.3, 1]

const regionOptions = GHANA_LOCATIONS.map((region) => ({ value: region.id, label: region.name }))

function Field({
  label,
  name,
  value,
  onChange,
  error = '',
  placeholder = '',
  required = false,
  type = 'text',
  inputMode,
  autoComplete,
  className = '',
}) {
  return (
    <label className={`grid gap-1.5 ${className}`}>
      <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-900">
        <span className="min-w-0">
          {label}
          {required ? <span className="text-auth-primary">*</span> : null}
        </span>
      </span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={Boolean(error)}
        className={`min-h-[2.375rem] w-full rounded-xl border bg-white px-3 py-2.5 text-xs outline-none transition-colors placeholder:text-slate-400 ${
          error
            ? 'border-auth-primary focus:border-auth-primary focus:ring-2 focus:ring-auth-primary/15'
            : 'border-slate-200 focus:border-auth-primary focus:ring-2 focus:ring-auth-primary/10'
        }`}
      />
      {error ? (
        <span className="text-xs font-medium text-auth-primary" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  )
}

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
  const districtOptions = useMemo(
    () => getDistrictsByRegion(form.region).map((district) => ({
      value: district.id,
      label: district.name,
    })),
    [form.region],
  )
  const title = editingId ? 'Edit address' : 'Add a new address'
  const typeLabel = form.type === 'billing' ? 'billing' : 'shipping'

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
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-auth-primary">
                  {form.type === 'billing' ? 'Billing address' : 'Shipping address'}
                </p>
                <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-950">{title}</h2>
                <p className="mt-1 text-xs text-slate-500">
                  {form.type === 'billing'
                    ? 'Required for receipts and payment records'
                    : 'Where should we deliver your order?'}
                </p>
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
                <div className="space-y-4">
                  {allowTypeChange ? (
                    <label className="grid gap-1.5">
                      <span className="text-xs font-semibold text-slate-900">Address type</span>
                      <select
                        name="type"
                        value={form.type}
                        onChange={onChange}
                        disabled={Boolean(editingId)}
                        className="min-h-[2.375rem] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-auth-primary focus:ring-2 focus:ring-auth-primary/10 disabled:bg-slate-50"
                      >
                        <option value="shipping">Delivery address</option>
                        <option value="billing">Billing address</option>
                      </select>
                    </label>
                  ) : null}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="First Name"
                      name="first_name"
                      required
                      value={form.first_name}
                      onChange={onChange}
                      placeholder="John"
                      autoComplete="given-name"
                    />
                    <Field
                      label="Last Name"
                      name="last_name"
                      required
                      value={form.last_name}
                      onChange={onChange}
                      placeholder="Doe"
                      autoComplete="family-name"
                    />
                  </div>

                  <Field
                    label="Email Address"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder="john@example.com"
                    autoComplete="email"
                  />

                  <Field
                    label="Phone Number"
                    name="phone_number"
                    required
                    type="tel"
                    inputMode="tel"
                    value={form.phone_number}
                    onChange={onChange}
                    placeholder="024 123 4567"
                    autoComplete="tel"
                  />

                  <Field
                    label="Street Address / House No."
                    name="address_line_1"
                    required
                    value={form.address_line_1}
                    onChange={onChange}
                    placeholder="House 12, Ring Road"
                    autoComplete="street-address"
                  />

                  <Field
                    label="Landmark / Area (optional)"
                    name="landmark"
                    value={form.landmark}
                    onChange={onChange}
                    placeholder="Near Accra Mall"
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <SearchableSelect
                      id="account-address-region"
                      label="Region"
                      compact
                      value={form.region}
                      onChange={onRegionChange}
                      options={regionOptions}
                      placeholder="Search regions…"
                      emptyLabel="Select region"
                    />
                    <SearchableSelect
                      id="account-address-town"
                      label="City / Town"
                      compact
                      value={form.city_or_town}
                      onChange={onTownChange}
                      options={townOptions}
                      placeholder="Accra"
                      emptyLabel="Select city"
                      allowOther
                      otherValue={LOCATION_OTHER_VALUE}
                      otherLabel="Other (enter custom city)"
                      customValue={form.town_custom}
                      onCustomChange={onTownCustomChange}
                      customInputPlaceholder="Type your city name"
                      disabled={!form.region}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <SearchableSelect
                      id="account-address-district"
                      label="District"
                      compact
                      value={form.district}
                      onChange={(value) => onChange({ target: { name: 'district', value } })}
                      options={districtOptions}
                      placeholder="Search districts…"
                      emptyLabel={form.region ? 'Select district' : 'Select region first'}
                      disabled={!form.region}
                    />
                    <Field
                      label="GhanaPost Digital Address"
                      name="digital_address"
                      value={form.digital_address}
                      onChange={onChange}
                      placeholder="GA-123-4567"
                    />
                  </div>

                  <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-3 text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      name="is_default"
                      checked={form.is_default}
                      onChange={onChange}
                      className="size-4 accent-auth-primary"
                    />
                    Make this my default {typeLabel} address
                  </label>
                </div>
              </div>

              <footer className="shrink-0 border-t border-slate-200/80 bg-white px-5 py-4">
                <div className="flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSaving}
                    className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    aria-busy={isSaving}
                    className="inline-flex min-w-36 items-center justify-center gap-2 rounded-full bg-auth-primary px-5 py-2.5 text-sm font-bold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-80"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Save className="size-4" strokeWidth={2.25} aria-hidden />
                        {editingId ? 'Save changes' : 'Save address'}
                      </>
                    )}
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
