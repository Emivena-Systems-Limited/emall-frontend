import { PHONE_COUNTRY_CODES } from '../../constants/profile'
import { ProfileFieldLabel, ProfileTextInput } from './ProfileSectionCard'

export default function ProfilePhoneInput({
  countryCode,
  localNumber,
  onCountryCodeChange,
  onLocalNumberChange,
  error,
  idPrefix = 'phone',
  disabled = false,
  optional = false,
}) {
  return (
    <div>
      <ProfileFieldLabel htmlFor={`${idPrefix}-local`}>
        Phone Number
        {optional && <span className="font-normal text-slate-400"> (Optional)</span>}
      </ProfileFieldLabel>
      <div className="flex gap-2">
        <select
          id={`${idPrefix}-country`}
          value={countryCode}
          onChange={(event) => onCountryCodeChange(event.target.value)}
          disabled={disabled}
          className="w-24 shrink-0 cursor-pointer rounded-xl border border-slate-300 bg-white px-2 py-2.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200/70 outline-none focus:border-brand focus:ring-2 focus:ring-brand-light disabled:cursor-not-allowed disabled:bg-slate-50"
        >
          {PHONE_COUNTRY_CODES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ProfileTextInput
          id={`${idPrefix}-local`}
          type="tel"
          value={localNumber}
          onChange={(event) => onLocalNumberChange(event.target.value)}
          placeholder="50085941 or 050085941"
          disabled={disabled}
          error={error}
        />
      </div>
    </div>
  )
}
