import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { ProfileFieldLabel } from './ProfileSectionCard'
import { DEFAULT_PHONE_COUNTRY } from '../../utils/phoneUtils'
import FieldError from '../auth/FieldError'

export default function InternationalPhoneInput({
  id,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  defaultCountry = DEFAULT_PHONE_COUNTRY,
  placeholder = '24 412 3456',
}) {
  return (
    <div>
      <ProfileFieldLabel htmlFor={id}>Phone number</ProfileFieldLabel>
      <PhoneInput
        id={id}
        name="phone_number"
        international
        defaultCountry={defaultCountry}
        countryCallingCodeEditable
        value={value || undefined}
        onChange={(next) => onChange(next ?? '')}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        numberInputProps={{
          autoComplete: 'tel',
          'aria-invalid': Boolean(error),
          'aria-describedby': error ? `${id}-error` : undefined,
        }}
        className={`international-phone-input ${error ? 'international-phone-input--error' : ''}`}
      />
      <FieldError id={`${id}-error`} message={error} />
    </div>
  )
}
