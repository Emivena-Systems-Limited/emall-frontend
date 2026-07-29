import { useMemo, useState } from 'react'
import { Building2, Landmark, MapPin, X } from 'lucide-react'
import SearchableSelect from '../../auth/SearchableSelect'
import { notify } from '../../../lib/notify'
import { firstValue } from '../../../utils/accountProfile'
import {
  GHANA_LOCATIONS,
  LOCATION_OTHER_VALUE,
  getCityLabel,
  getCityOptionsByRegion,
  getDistrictsByRegion,
  getDistrictsByRegionAndCity,
  resolveCitySelection,
} from '../../../constants/ghanaLocations'

const profileRegionOptions = GHANA_LOCATIONS.map((region) => ({
  value: region.id,
  label: region.name,
}))

function resolveProfileRegion(value) {
  const raw = String(value ?? '').trim()
  return GHANA_LOCATIONS.find((region) => region.id === raw || region.name.toLowerCase() === raw.toLowerCase())?.id ?? ''
}

function resolveProfileCity(regionId, value) {
  const raw = String(value ?? '').trim()
  const match = getCityOptionsByRegion(regionId).find(
    (option) => option.value === raw || option.label.toLowerCase() === raw.toLowerCase(),
  )
  return match ? { city: match.value, cityCustom: '' } : { city: raw ? LOCATION_OTHER_VALUE : '', cityCustom: raw }
}

function resolveProfileDistrict(regionId, value) {
  const raw = String(value ?? '').trim()
  const match = getDistrictsByRegion(regionId).find(
    (district) => district.id === raw || district.name.toLowerCase() === raw.toLowerCase(),
  )
  return match ? { district: match.id, districtCustom: '' } : { district: raw ? LOCATION_OTHER_VALUE : '', districtCustom: raw }
}

export default function EditProfileModal({ initialProfile, isSaving, onClose, onSave }) {
  const initialRegion = resolveProfileRegion(initialProfile?.region)
  const initialCity = resolveProfileCity(
    initialRegion,
    firstValue(initialProfile?.city_or_town, initialProfile?.city, initialProfile?.town),
  )
  const initialDistrict = resolveProfileDistrict(initialRegion, initialProfile?.district)
  const [form, setForm] = useState(() => ({
    first_name: firstValue(initialProfile?.first_name, initialProfile?.firstName),
    last_name: firstValue(initialProfile?.last_name, initialProfile?.lastName),
    email: firstValue(initialProfile?.email),
    phone_number: firstValue(initialProfile?.phone_number, initialProfile?.phone),
    region: initialRegion,
    city: initialCity.city,
    cityCustom: initialCity.cityCustom,
    district: initialDistrict.district,
    districtCustom: initialDistrict.districtCustom,
  }))

  const cityOptions = useMemo(() => getCityOptionsByRegion(form.region), [form.region])
  const districts = useMemo(() => {
    if (!form.region) return []
    return form.city === LOCATION_OTHER_VALUE
      ? getDistrictsByRegion(form.region)
      : getDistrictsByRegionAndCity(form.region, form.city)
  }, [form.region, form.city])
  const districtOptions = districts.map((district) => ({
    value: district.id,
    label: district.name,
  }))

  const updateLocation = (field, value) => {
    setForm((current) => {
      const next = { ...current, [field]: value }
      if (field === 'region') {
        return { ...next, city: '', cityCustom: '', district: '', districtCustom: '' }
      }
      if (field === 'city') {
        next.cityCustom = ''
        next.districtCustom = ''
        next.district = value === LOCATION_OTHER_VALUE
          ? ''
          : resolveCitySelection(current.region, value).districtId
      }
      if (field === 'district' && value !== LOCATION_OTHER_VALUE) next.districtCustom = ''
      return next
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (
      !form.region
      || !form.city
      || !form.district
      || (form.city === LOCATION_OTHER_VALUE && !form.cityCustom.trim())
      || (form.district === LOCATION_OTHER_VALUE && !form.districtCustom.trim())
    ) {
      notify.error('Please complete your region, city or town, and district')
      return
    }

    const region = GHANA_LOCATIONS.find((item) => item.id === form.region)?.name ?? ''
    const city_or_town = form.city === LOCATION_OTHER_VALUE
      ? form.cityCustom.trim()
      : getCityLabel(form.region, form.city)
    const district = form.district === LOCATION_OTHER_VALUE
      ? form.districtCustom.trim()
      : (getDistrictsByRegion(form.region).find((item) => item.id === form.district)?.name ?? '')

    onSave({
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      phone_number: form.phone_number.trim(),
      region,
      district,
      city_or_town,
    })
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Edit profile"
    >
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-auth-primary">Account profile</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">Edit profile</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            ['first_name', 'First name'],
            ['last_name', 'Last name'],
            ['email', 'Email address'],
            ['phone_number', 'Phone number'],
          ].map(([name, label]) => (
            <label key={name} className="grid gap-2 text-sm font-semibold text-slate-700">
              <span>{label}</span>
              <input
                value={form[name]}
                onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))}
                className="h-12 rounded-xl border border-slate-300 px-4 font-normal outline-none transition-colors focus:border-auth-primary focus:ring-2 focus:ring-red-100"
              />
            </label>
          ))}
          <SearchableSelect
            id="profile-region"
            label="Region"
            icon={MapPin}
            value={form.region}
            onChange={(value) => updateLocation('region', value)}
            options={profileRegionOptions}
            placeholder="Search regions…"
            emptyLabel="Select region"
          />
          <SearchableSelect
            id="profile-city"
            label="City or town"
            icon={Building2}
            value={form.city}
            onChange={(value) => updateLocation('city', value)}
            options={cityOptions}
            placeholder="Search cities and towns…"
            emptyLabel="Select city or town"
            allowOther
            otherValue={LOCATION_OTHER_VALUE}
            otherLabel="Other (enter custom city)"
            customValue={form.cityCustom}
            onCustomChange={(cityCustom) => setForm((current) => ({ ...current, cityCustom }))}
            customInputPlaceholder="Type your city or town"
            disabled={!form.region}
          />
          <div className="sm:col-span-2">
            <SearchableSelect
              id="profile-district"
              label="District"
              icon={Landmark}
              value={form.district}
              onChange={(value) => updateLocation('district', value)}
              options={districtOptions}
              placeholder="Search districts…"
              emptyLabel="Select district"
              allowOther
              otherValue={LOCATION_OTHER_VALUE}
              otherLabel="Other (enter custom district)"
              customValue={form.districtCustom}
              onCustomChange={(districtCustom) => setForm((current) => ({ ...current, districtCustom }))}
              customInputPlaceholder="Type your district name"
              disabled={!form.region || !form.city}
            />
          </div>
        </div>

        <div className="mt-7 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-auth-primary px-6 py-3 text-sm font-bold text-white hover:bg-auth-primary-hover disabled:opacity-60"
          >
            {isSaving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
