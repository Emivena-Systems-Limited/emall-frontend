import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Form } from 'formik'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  FileBadge2,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Navigation,
  Phone,
  ShieldCheck,
  Store,
  User,
} from 'lucide-react'
import FormInput from './FormInput'
import FormTextarea from './FormTextarea'
import PasswordInput from './PasswordInput'
import PasswordStrengthBar from './PasswordStrengthBar'
import SectionHeading from './SectionHeading'
import SearchableSelect from './SearchableSelect'
// import FileUploadField from './FileUploadField' // Hidden until backend file storage is ready
import RegistrationProgress from './RegistrationProgress'
import SignupErrorBanner from './SignupErrorBanner'
import { GHANA_REGIONS, getCitiesByRegion } from '../../constants/ghanaRegions'
import { getDistrictsByRegion } from '../../constants/ghanaDistricts'
import { REGISTRATION_STEPS, VENDOR_TERMS_URL } from '../../constants/vendorTerms'
import { scrollToFirstError } from '../../utils/scrollToFirstError'
import { scrollAuthPanelToTop } from '../../utils/scrollAuthPanelToTop'
import { vendorSignupStepFields, vendorSignupStepSchemas, VENDOR_ADDRESS_MAX_LENGTH } from '../../utils/validationSchemas'

const LAST_STEP = REGISTRATION_STEPS.length - 1

function ConsentCheckbox({ id, name, checked, onChange, onBlur, error, children }) {
  return (
    <label
      data-field={name}
      className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3.5 transition-colors ${
        error
          ? 'border-red-300 bg-red-50/50'
          : checked
            ? 'border-brand/30 bg-brand-light/30'
            : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
      }`}
    >
      <input
        id={id}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        onBlur={onBlur}
        className="mt-0.5 size-4 shrink-0 cursor-pointer accent-brand rounded"
      />
      <span className="text-sm leading-relaxed text-slate-700">{children}</span>
    </label>
  )
}

export default function SignupFormFields({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
  setFieldTouched,
  setErrors,
  isSubmitting,
  submitCount,
  registerPending,
  submitError,
  onDismissError,
}) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState([])
  const isInitialStepMount = useRef(true)

  const districtOptions = useMemo(
    () => getDistrictsByRegion(values.region).map((district) => ({
      value: district.toLowerCase(),
      label: district,
    })),
    [values.region],
  )

  const cityOptions = useMemo(
    () => getCitiesByRegion(values.region).map((city) => ({
      value: city.toLowerCase(),
      label: city,
    })),
    [values.region],
  )

  useEffect(() => {
    if (submitCount > 0 && Object.keys(errors).length > 0) {
      scrollToFirstError(errors)
    }
  }, [submitCount]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!submitError?.fieldErrors || Object.keys(submitError.fieldErrors).length === 0) return

    setErrors(submitError.fieldErrors)
    Object.keys(submitError.fieldErrors).forEach((field) => {
      setFieldTouched(field, true, false)
    })

    const stepIndex = vendorSignupStepFields.findIndex((fields) =>
      fields.some((field) => field in submitError.fieldErrors),
    )

    if (stepIndex >= 0) {
      setCurrentStep(stepIndex)
    }

    scrollToFirstError(submitError.fieldErrors)
  }, [submitError, setErrors, setFieldTouched])

  useEffect(() => {
    if (isInitialStepMount.current) {
      isInitialStepMount.current = false
      return
    }
    scrollAuthPanelToTop()
  }, [currentStep])

  const handleRegionChange = useCallback(
    (event) => {
      handleChange(event)
      setFieldValue('district', '')
      setFieldValue('city_or_town', '')
    },
    [handleChange, setFieldValue],
  )

  const validateCurrentStep = useCallback(async () => {
    const schema = vendorSignupStepSchemas[currentStep]
    const fields = vendorSignupStepFields[currentStep]

    await Promise.all(fields.map((field) => setFieldTouched(field, true, false)))

    try {
      await schema.validate(values, { abortEarly: false })
      return {}
    } catch (validationError) {
      return validationError.inner.reduce((acc, err) => {
        acc[err.path] = err.message
        return acc
      }, {})
    }
  }, [currentStep, setFieldTouched, values])

  const handleContinue = async () => {
    onDismissError?.()
    const stepErrors = await validateCurrentStep()

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      scrollToFirstError(stepErrors)
      return
    }

    setCompletedSteps((prev) => {
      const stepId = REGISTRATION_STEPS[currentStep].id
      return prev.includes(stepId) ? prev : [...prev, stepId]
    })
    setErrors({})
    setCurrentStep((step) => Math.min(step + 1, LAST_STEP))
  }

  const handleBack = () => {
    onDismissError?.()
    setCurrentStep((step) => Math.max(step - 1, 0))
  }

  const passwordsMatch =
    values.password_confirmation.length > 0 &&
    values.password === values.password_confirmation

  const canSubmitLastStep =
    values.password &&
    values.password_confirmation &&
    values.confirm_accurate &&
    values.agree_terms &&
    !errors.password &&
    !errors.password_confirmation &&
    !errors.confirm_accurate &&
    !errors.agree_terms &&
    !isSubmitting &&
    !registerPending

  const stepKey = REGISTRATION_STEPS[currentStep].id

  return (
    <Form className="page-enter space-y-5 pb-2">
      <RegistrationProgress activeStep={currentStep} completedSteps={completedSteps} />

      {submitError && (
        <SignupErrorBanner
          title={submitError.message}
          errors={submitError.errors}
          onDismiss={onDismissError}
        />
      )}

      <div key={stepKey} className="dashboard-reveal">
        {currentStep === 0 && (
          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
              <SectionHeading
                step={1}
                icon={Building2}
                title="Business information"
                description="Tell us about your registered business and trading name."
              />
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <FormInput
                  id="business_name"
                  name="business_name"
                  label="Business name"
                  icon={Building2}
                  placeholder="Emivena Ventures Ltd."
                  value={values.business_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.business_name && errors.business_name}
                  disabled={isSubmitting}
                />
                <FormInput
                  id="trading_name"
                  name="trading_name"
                  label="Trading name"
                  icon={Store}
                  placeholder="Emivena Stores"
                  hint="The name customers will see on your storefront"
                  value={values.trading_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.trading_name && errors.trading_name}
                  disabled={isSubmitting}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
              <SectionHeading
                icon={MapPin}
                title="Store address"
                description="Where is your store physically located?"
              />
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <SearchableSelect
                  id="region"
                  name="region"
                  label="Region"
                  icon={MapPin}
                  options={GHANA_REGIONS}
                  value={values.region}
                  onChange={handleRegionChange}
                  onBlur={handleBlur}
                  error={touched.region && errors.region}
                  disabled={isSubmitting}
                  placeholder="Select region…"
                />
                <SearchableSelect
                  key={`district-${values.region || 'none'}`}
                  id="district"
                  name="district"
                  label="District"
                  icon={MapPin}
                  options={districtOptions}
                  value={values.district}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.district && errors.district}
                  disabled={isSubmitting || !values.region}
                  placeholder={values.region ? 'Select district…' : 'Select region first'}
                  allowCustom
                  customPlaceholder="Enter district…"
                />
                <SearchableSelect
                  key={`city-${values.region || 'none'}`}
                  id="city_or_town"
                  name="city_or_town"
                  label="Town / City"
                  icon={MapPin}
                  options={cityOptions}
                  value={values.city_or_town}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.city_or_town && errors.city_or_town}
                  disabled={isSubmitting || !values.region}
                  placeholder={values.region ? 'Select town or city…' : 'Select region first'}
                  allowCustom
                  customPlaceholder="Enter town or city…"
                />
                <FormInput
                  id="gps_address"
                  name="gps_address"
                  label="GPS"
                  icon={Navigation}
                  placeholder="GA-145-4789"
                  hint="Ghana Post digital address"
                  value={values.gps_address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.gps_address && errors.gps_address}
                  disabled={isSubmitting}
                />
                <div className="sm:col-span-2">
                  <FormTextarea
                    id="address"
                    name="address"
                    label="Physical address"
                    icon={MapPin}
                    placeholder="15 Independence Avenue, Near Osu Oxford Street"
                    hint="Enter your store address exactly as you want it saved"
                    value={values.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.address && errors.address}
                    disabled={isSubmitting}
                    maxLength={VENDOR_ADDRESS_MAX_LENGTH}
                  />
                </div>
                <FormInput
                  id="street_name"
                  name="street_name"
                  label="Street name"
                  icon={MapPin}
                  placeholder="15 Independence Avenue"
                  value={values.street_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.street_name && errors.street_name}
                  disabled={isSubmitting}
                />
                <FormInput
                  id="landmark"
                  name="landmark"
                  label="Landmark"
                  icon={MapPin}
                  placeholder="Near Osu Oxford Street (optional)"
                  value={values.landmark}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.landmark && errors.landmark}
                  disabled={isSubmitting}
                />
              </div>
            </section>
          </div>
        )}

        {currentStep === 1 && (
          <section className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 p-5 sm:p-6">
            <SectionHeading
              step={2}
              icon={FileBadge2}
              title="Business verification"
              description="Optional — speed up approval by sharing registration documents."
            />
            <span className="mt-3 inline-flex rounded-full bg-slate-200/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
              Optional — you can skip this step
            </span>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <FormInput
                id="business_registration_number"
                name="business_registration_number"
                label="Business registration number"
                icon={FileBadge2}
                placeholder="BN123456789"
                value={values.business_registration_number}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.business_registration_number && errors.business_registration_number}
                disabled={isSubmitting}
              />
              <FormInput
                id="tin_number"
                name="tin_number"
                label="TIN number"
                icon={FileBadge2}
                placeholder="P0001234567"
                value={values.tin_number}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.tin_number && errors.tin_number}
                disabled={isSubmitting}
              />
              {/* Hidden until backend file storage is ready
              <div className="sm:col-span-2">
                <FileUploadField
                  id="registration_certificate"
                  name="registration_certificate"
                  label="Upload business registration certificate"
                  hint="Accepted formats: JPG, PNG, PDF. Maximum size 5MB."
                  value={values.registration_certificate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.registration_certificate && errors.registration_certificate}
                  disabled={isSubmitting}
                />
              </div>
              */}
            </div>
          </section>
        )}

        {currentStep === 2 && (
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
            <SectionHeading
              step={3}
              icon={User}
              title="Store contact information"
              description="Who should we contact about your vendor account?"
            />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <FormInput
                  id="admin_full_name"
                  name="admin_full_name"
                  label="Store admin full name"
                  icon={User}
                  placeholder="Ama Mensah"
                  value={values.admin_full_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.admin_full_name && errors.admin_full_name}
                  disabled={isSubmitting}
                />
              </div>
              <FormInput
                id="phone_number"
                name="phone_number"
                label="Mobile number"
                icon={Phone}
                type="tel"
                placeholder="0241234567"
                hint="Valid Ghanaian mobile number only"
                value={values.phone_number}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.phone_number && errors.phone_number}
                disabled={isSubmitting}
              />
              <FormInput
                id="email"
                name="email"
                label="Email address"
                icon={Mail}
                type="email"
                placeholder="you@business.com"
                autoComplete="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email && errors.email}
                disabled={isSubmitting}
              />
            </div>
          </section>
        )}

        {currentStep === 3 && (
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
            <SectionHeading
              step={4}
              icon={ShieldCheck}
              title="Account security & consent"
              description="Set your login password and confirm the following before submitting."
            />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <PasswordInput
                  id="password"
                  name="password"
                  label="Password"
                  icon={Lock}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.password && errors.password}
                  disabled={isSubmitting}
                />
                <PasswordStrengthBar password={values.password} />
              </div>
              <div>
                <PasswordInput
                  id="password_confirmation"
                  name="password_confirmation"
                  label="Confirm password"
                  icon={Lock}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  value={values.password_confirmation}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.password_confirmation && errors.password_confirmation}
                  disabled={isSubmitting}
                />
                {passwordsMatch && (
                  <p className="error-animate mt-1.5 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                    <CheckCircle2 className="size-3.5" strokeWidth={2.5} />
                    Passwords match
                  </p>
                )}
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <ConsentCheckbox
                id="confirm_accurate"
                name="confirm_accurate"
                checked={values.confirm_accurate}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.confirm_accurate && errors.confirm_accurate}
              >
                I confirm that the information provided is accurate.
              </ConsentCheckbox>
              {touched.confirm_accurate && errors.confirm_accurate && (
                <p className="text-xs font-medium text-red-600">{errors.confirm_accurate}</p>
              )}

              <ConsentCheckbox
                id="agree_terms"
                name="agree_terms"
                checked={values.agree_terms}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.agree_terms && errors.agree_terms}
              >
                I agree to the{' '}
                <a
                  href={VENDOR_TERMS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-brand underline-offset-2 hover:underline"
                  onClick={(event) => event.stopPropagation()}
                >
                  Vendor Terms and Conditions
                </a>
                .
              </ConsentCheckbox>
              {touched.agree_terms && errors.agree_terms && (
                <p className="text-xs font-medium text-red-600">{errors.agree_terms}</p>
              )}
            </div>
          </section>
        )}
      </div>

      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
        {currentStep > 0 ? (
          <button
            type="button"
            onClick={handleBack}
            disabled={isSubmitting || registerPending}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[140px]"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
        ) : (
          <p className="hidden text-sm text-slate-600 sm:block">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-brand underline-offset-2 transition-colors hover:text-brand-hover hover:underline"
            >
              Sign in
            </Link>
          </p>
        )}

        {currentStep < LAST_STEP ? (
          <button
            type="button"
            onClick={handleContinue}
            disabled={isSubmitting || registerPending}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60 sm:ml-auto sm:w-auto sm:min-w-[160px]"
          >
            Continue
            <ArrowRight className="size-4" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!canSubmitLastStep}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60 sm:ml-auto sm:w-auto sm:min-w-[200px]"
          >
            {isSubmitting || registerPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                Submit application
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        )}
      </div>

      {currentStep === 0 && (
        <p className="text-center text-sm text-slate-600 sm:hidden">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-brand underline-offset-2 transition-colors hover:text-brand-hover hover:underline"
          >
            Sign in
          </Link>
        </p>
      )}

      <p className="text-center text-xs text-slate-400">
        Step {currentStep + 1} of {REGISTRATION_STEPS.length}
      </p>
    </Form>
  )
}
