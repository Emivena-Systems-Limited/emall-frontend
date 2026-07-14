import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import {
  Building2,
  Landmark,
  Mail,
  MapPin,
  User,
  UserRound,
  Users,
} from 'lucide-react'
import AuthLayout from '../../components/auth/AuthLayout'
import AuthHomeLink from '../../components/auth/AuthHomeLink'
import FormField from '../../components/auth/FormField'
import {
  formActionsMotion,
  formHeaderMotion,
  formStaggerContainer,
} from '../../components/auth/formMotion'
import PhoneInput from '../../components/auth/PhoneInput'
import SearchableSelect from '../../components/auth/SearchableSelect'
import SelectInput from '../../components/auth/SelectInput'
import TermsCheckbox from '../../components/auth/TermsCheckbox'
import TextInput from '../../components/auth/TextInput'
import FieldError from '../../components/auth/FieldError'
import notify from '../../lib/notify'
import {
  useRegisterUserMutation,
} from '../../hooks/useAuthMutations'
import { AUTH_FLOW, AUTH_METHODS } from '../../constants/auth'
import { saveAuthOtpSession } from '../../utils/authOtpSession'
import {
  GENDER_OPTIONS,
  GHANA_LOCATIONS,
  getCityLabel,
  getCityOptionsByRegion,
  getDistrictsByRegion,
  getDistrictsByRegionAndCity,
  LOCATION_OTHER_VALUE,
  resolveCitySelection,
} from '../../constants/ghanaLocations'
import {
  formatGhanaPhoneDisplay,
  normalizeGhanaPhone,
  validateEmail,
  validateGhanaPhone,
  validatePersonName,
} from '../../utils/validateGhanaPhone'
import { scrollToFirstError } from '../../utils/scrollToFirstError'

const REGISTER_FIELD_ORDER = [
  'firstName',
  'lastName',
  'phone',
  'email',
  'region',
  'city',
  'cityCustom',
  'district',
  'districtCustom',
  'gender',
  'terms',
]

const initialForm = {
  firstName: '',
  lastName: '',
  gender: '',
  email: '',
  region: '',
  city: '',
  cityCustom: '',
  district: '',
  districtCustom: '',
  phone: '',
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [termsError, setTermsError] = useState('')
  const registerUserMutation = useRegisterUserMutation()
  const isSubmitting = registerUserMutation.isPending

  const cityOptions = useMemo(
    () => getCityOptionsByRegion(form.region),
    [form.region],
  )

  const districts = useMemo(() => {
    if (!form.region) return []

    if (form.city === LOCATION_OTHER_VALUE) {
      return getDistrictsByRegion(form.region)
    }

    return getDistrictsByRegionAndCity(form.region, form.city)
  }, [form.region, form.city])

  const regionOptions = GHANA_LOCATIONS.map((region) => ({
    value: region.id,
    label: region.name,
  }))

  const districtOptions = districts.map((district) => ({
    value: district.id,
    label: district.name,
  }))

  const genderOptions = GENDER_OPTIONS.map((option) => ({
    ...option,
    disabled: option.value === '',
  }))

  const setFieldError = (field, message) => {
    setErrors((prev) => {
      if ((prev[field] || '') === (message || '')) return prev
      return { ...prev, [field]: message || '' }
    })
  }

  const validateNameField = (field, value, { fieldLabel, requireValue = false } = {}) => {
    const trimmed = String(value ?? '').trim()
    if (!trimmed && !requireValue) {
      setFieldError(field, '')
      return { valid: true, name: '' }
    }

    const result = validatePersonName(value, { fieldLabel })
    setFieldError(field, result.valid ? '' : result.message)
    return result
  }

  const validateEmailField = (value, { requireValue = false } = {}) => {
    const trimmed = String(value ?? '').trim()
    if (!trimmed && !requireValue) {
      setFieldError('email', '')
      return { valid: true, email: '' }
    }

    const result = validateEmail(value)
    setFieldError('email', result.valid ? '' : result.message)
    return result
  }

  const updateField = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value }

      if (field === 'region') {
        next.city = ''
        next.cityCustom = ''
        next.district = ''
        next.districtCustom = ''
      }

      if (field === 'city') {
        if (value === LOCATION_OTHER_VALUE) {
          next.cityCustom = ''
          next.district = ''
          next.districtCustom = ''
        } else {
          next.cityCustom = ''
          const { districtId } = resolveCitySelection(prev.region, value)
          next.district = districtId
          if (districtId) next.districtCustom = ''
        }
      }

      if (field === 'district' && value !== LOCATION_OTHER_VALUE) {
        next.districtCustom = ''
      }

      return next
    })

    if (field === 'firstName') {
      validateNameField('firstName', value, { fieldLabel: 'First name' })
      return
    }

    if (field === 'lastName') {
      validateNameField('lastName', value, { fieldLabel: 'Last name' })
      return
    }

    if (field === 'email') {
      if (errors.email || value.includes('@') || /\s/.test(value)) {
        validateEmailField(value)
      }
      return
    }

    if (errors[field]) {
      setFieldError(field, '')
    }
  }

  const buildFormErrors = () => {
    const nextErrors = {}

    const firstNameResult = validatePersonName(form.firstName, { fieldLabel: 'First name' })
    if (!firstNameResult.valid) nextErrors.firstName = firstNameResult.message

    const lastNameResult = validatePersonName(form.lastName, { fieldLabel: 'Last name' })
    if (!lastNameResult.valid) nextErrors.lastName = lastNameResult.message

    if (!form.gender) nextErrors.gender = 'Please select your gender'

    const emailResult = validateEmail(form.email)
    if (!emailResult.valid) nextErrors.email = emailResult.message

    if (!form.region) nextErrors.region = 'Please select your region'

    if (!form.city) {
      nextErrors.city = 'Please select your city'
    } else if (form.city === LOCATION_OTHER_VALUE && !form.cityCustom.trim()) {
      nextErrors.cityCustom = 'Please enter your city'
    }

    if (!form.district) {
      nextErrors.district = 'Please select your district'
    } else if (form.district === LOCATION_OTHER_VALUE && !form.districtCustom.trim()) {
      nextErrors.districtCustom = 'Please enter your district'
    }

    const phoneResult = validateGhanaPhone(form.phone)
    if (!phoneResult.valid) nextErrors.phone = phoneResult.message

    return nextErrors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const nextErrors = buildFormErrors()
    const nextTermsError = acceptedTerms ? '' : 'Please accept the terms and conditions'

    setErrors(nextErrors)
    setTermsError(nextTermsError)

    const allErrors = nextTermsError
      ? { ...nextErrors, terms: nextTermsError }
      : nextErrors

    if (Object.keys(allErrors).length > 0) {
      scrollToFirstError(allErrors, REGISTER_FIELD_ORDER)
      return
    }

    const phoneResult = validateGhanaPhone(form.phone)
    const regionName = GHANA_LOCATIONS.find((region) => region.id === form.region)?.name ?? ''
    const cityName =
      form.city === LOCATION_OTHER_VALUE
        ? form.cityCustom.trim()
        : getCityLabel(form.region, form.city)
    const districtName =
      form.district === LOCATION_OTHER_VALUE
        ? form.districtCustom.trim()
        : getDistrictsByRegion(form.region).find((district) => district.id === form.district)?.name ?? ''

    const profile = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      gender: form.gender,
      email: form.email.trim(),
      region: regionName,
      city: cityName,
      district: districtName,
      phone: phoneResult.e164,
    }

    try {
      await registerUserMutation.mutateAsync(profile)

      const otpSession = {
        flow: AUTH_FLOW.REGISTER,
        method: AUTH_METHODS.EMAIL,
        contact: profile.email,
        displayContact: profile.email,
        profile,
        ...(redirectTo ? { redirectTo } : {}),
      }
      saveAuthOtpSession(otpSession)

      navigate('/register/verify', {
        state: otpSession,
      })
    } catch (error) {
      notify.fromError(error, 'Could not complete registration')
    }
  }

  return (
    <AuthLayout wide>
      <motion.div {...formHeaderMotion} className="text-center">
        <p className="auth-subheading font-medium tracking-wide text-auth-muted">
          Let&apos;s get you started
        </p>
        <h1 className="auth-heading mt-1.5 font-bold tracking-tight text-slate-900">
          Register your account
        </h1>
        <p className="auth-body mx-auto mt-1.5 max-w-md leading-relaxed text-slate-500">
          Create your EZ-Stores account to shop, track orders, and checkout faster.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4 sm:mt-5">
        <motion.div
          variants={formStaggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4"
        >
            <FormField name="firstName">
              <TextInput
                id="firstName"
                label="First name"
                icon={User}
                value={form.firstName}
                onChange={(value) => updateField('firstName', value)}
                onBlur={() =>
                  validateNameField('firstName', form.firstName, {
                    fieldLabel: 'First name',
                    requireValue: Boolean(form.firstName.trim()),
                  })
                }
                error={errors.firstName}
                disabled={isSubmitting}
                autoComplete="given-name"
              />
            </FormField>
            <FormField name="lastName">
              <TextInput
                id="lastName"
                label="Last name"
                icon={UserRound}
                value={form.lastName}
                onChange={(value) => updateField('lastName', value)}
                onBlur={() =>
                  validateNameField('lastName', form.lastName, {
                    fieldLabel: 'Last name',
                    requireValue: Boolean(form.lastName.trim()),
                  })
                }
                error={errors.lastName}
                disabled={isSubmitting}
                autoComplete="family-name"
              />
            </FormField>
            <FormField name="phone">
              <PhoneInput
                value={form.phone}
                onChange={(value) => updateField('phone', formatGhanaPhoneDisplay(normalizeGhanaPhone(value)))}
                onBlur={() => {
                  if (!form.phone.trim()) return
                  const result = validateGhanaPhone(form.phone)
                  setFieldError('phone', result.valid ? '' : result.message)
                }}
                error={errors.phone}
                disabled={isSubmitting}
              />
            </FormField>
            <FormField name="email">
              <TextInput
                id="email"
                label="Email address"
                icon={Mail}
                type="email"
                value={form.email}
                onChange={(value) => updateField('email', value)}
                onBlur={() =>
                  validateEmailField(form.email, {
                    requireValue: Boolean(form.email.trim()),
                  })
                }
                error={errors.email}
                disabled={isSubmitting}
                autoComplete="email"
              />
            </FormField>
            <FormField name="region">
              <SearchableSelect
                id="region"
                label="Region"
                icon={MapPin}
                value={form.region}
                onChange={(value) => updateField('region', value)}
                options={regionOptions}
                placeholder="Search regions…"
                emptyLabel="Select region"
                error={errors.region}
                disabled={isSubmitting}
              />
            </FormField>
            <FormField name="city">
              <SearchableSelect
                id="city"
                label="City"
                icon={Building2}
                value={form.city}
                onChange={(value) => updateField('city', value)}
                options={cityOptions}
                placeholder="Search cities…"
                emptyLabel="Select city"
                allowOther
                otherValue={LOCATION_OTHER_VALUE}
                customValue={form.cityCustom}
                onCustomChange={(value) => updateField('cityCustom', value)}
                customInputPlaceholder="Type your city name"
                error={errors.city}
                customError={errors.cityCustom}
                disabled={isSubmitting || !form.region}
              />
            </FormField>
            <FormField name="district">
              <SearchableSelect
                id="district"
                label="District"
                icon={Landmark}
                value={form.district}
                onChange={(value) => updateField('district', value)}
                options={districtOptions}
                placeholder="Search districts…"
                emptyLabel="Select district"
                allowOther
                otherValue={LOCATION_OTHER_VALUE}
                customValue={form.districtCustom}
                onCustomChange={(value) => updateField('districtCustom', value)}
                customInputPlaceholder="Type your district name"
                error={errors.district}
                customError={errors.districtCustom}
                disabled={isSubmitting || !form.city}
              />
            </FormField>
            <FormField name="gender">
              <SelectInput
                id="gender"
                label="Gender"
                icon={Users}
                value={form.gender}
                onChange={(value) => updateField('gender', value)}
                options={genderOptions}
                error={errors.gender}
                disabled={isSubmitting}
              />
            </FormField>
          </motion.div>

          <motion.div variants={formActionsMotion} initial="hidden" animate="visible">
            <FormField name="terms">
              <TermsCheckbox
                checked={acceptedTerms}
                onChange={setAcceptedTerms}
                disabled={isSubmitting}
              />
              <FieldError message={termsError} />
            </FormField>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileTap={{ scale: 0.985 }}
              className="mt-4 w-full rounded-xl bg-auth-primary py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-14px_rgba(199,59,45,0.65)] transition-colors hover:bg-auth-primary-hover disabled:cursor-not-allowed disabled:opacity-70 sm:py-3 min-[1800px]:py-4 min-[1800px]:text-base"
            >
              {isSubmitting ? 'Creating account…' : 'Continue'}
            </motion.button>
          </motion.div>
        </form>

        <motion.p
          {...formHeaderMotion}
          className="auth-body mt-4 text-center text-auth-muted sm:mt-5"
        >
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-auth-accent underline-offset-2 transition-colors hover:text-auth-primary hover:underline"
          >
            Login
          </Link>
        </motion.p>

        <AuthHomeLink />
    </AuthLayout>
  )
}
