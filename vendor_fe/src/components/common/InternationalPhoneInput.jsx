import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { ProfileFieldLabel } from '../profile/ProfileSectionCard'

export default function InternationalPhoneInput({
  id,
  value,
  onChange,
  error,
  optional = false,
  defaultCountry = 'GH',
  disabled = false,
  placeholder = 'Enter phone number',
}) {
  return (
    <div>
      <ProfileFieldLabel htmlFor={id}>
        Phone Number
        {optional && <span className="font-normal text-slate-400"> (Optional)</span>}
      </ProfileFieldLabel>
      <PhoneInput
        id={id}
        international
        defaultCountry={defaultCountry}
        countryCallingCodeEditable={false}
        value={value || undefined}
        onChange={(next) => onChange(next ?? '')}
        disabled={disabled}
        placeholder={placeholder}
        className={`international-phone-input ${error ? 'international-phone-input--error' : ''}`}
      />
      {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
    </div>
  )
}
