import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Form } from 'formik'
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Store,
} from 'lucide-react'
import FormInput from './FormInput'
import PasswordInput from './PasswordInput'
import SectionHeading from './SectionHeading'
import SearchableSelect from './SearchableSelect'
import PasswordStrengthBar from './PasswordStrengthBar'
import { GHANA_REGIONS, getCitiesByRegion } from '../../constants/ghanaRegions'
import { scrollToFirstError } from '../../utils/scrollToFirstError'

export default function SignupFormFields({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
  isSubmitting,
  submitCount,
  registerPending,
}) {
  const [sameAsBusiness, setSameAsBusiness] = useState(false)

  const cityOptions = useMemo(
    () => getCitiesByRegion(values.region).map((c) => ({ value: c.toLowerCase(), label: c })),
    [values.region],
  )

  // Sync store_name → business_name when toggle is on
  useEffect(() => {
    if (sameAsBusiness) setFieldValue('store_name', values.business_name)
  }, [sameAsBusiness, values.business_name, setFieldValue])

  // Scroll to first error when user tries to submit
  useEffect(() => {
    if (submitCount > 0 && Object.keys(errors).length > 0) {
      scrollToFirstError(errors)
    }
  }, [submitCount]) // eslint-disable-line react-hooks/exhaustive-deps

  // Custom onChange for region — also clears city
  const handleRegionChange = useCallback(
    (e) => {
      handleChange(e)
      setFieldValue('city_or_town', '')
    },
    [handleChange, setFieldValue],
  )

  const passwordsMatch =
    values.password_confirmation.length > 0 &&
    values.password === values.password_confirmation

  return (
    <Form className="page-enter space-y-5 pb-2">
      {/* ── 1. Business Details ─────────────────────────── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <SectionHeading
          step={1}
          icon={Building2}
          title="Business details"
          description="Tell us about your business and store."
        />
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <FormInput
            id="business_name"
            name="business_name"
            label="Business name"
            icon={Building2}
            placeholder="Emivena Ventures"
            value={values.business_name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.business_name && errors.business_name}
            disabled={isSubmitting}
          />

          <div>
            <FormInput
              id="store_name"
              name="store_name"
              label="Store name"
              icon={Store}
              placeholder="Eminvena Stores"
              value={values.store_name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.store_name && errors.store_name}
              disabled={isSubmitting || sameAsBusiness}
            />
            <label className="mt-2 flex cursor-pointer items-center gap-2 select-none">
              <input
                type="checkbox"
                checked={sameAsBusiness}
                onChange={(e) => {
                  setSameAsBusiness(e.target.checked)
                  if (!e.target.checked) setFieldValue('store_name', '')
                }}
                className="size-3.5 cursor-pointer accent-brand rounded"
              />
              <span className="text-xs text-slate-500">Same as business name</span>
            </label>
          </div>
        </div>
      </section>

      {/* ── 2. Account Security ─────────────────────────── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <SectionHeading
          step={2}
          icon={Lock}
          title="Account security"
          description="Set up your login credentials."
        />
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
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

          <FormInput
            id="phone_number"
            name="phone_number"
            label="Phone number"
            icon={Phone}
            type="tel"
            placeholder="0574622234"
            hint="10-digit Ghana number starting with 0"
            value={values.phone_number}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.phone_number && errors.phone_number}
            disabled={isSubmitting}
          />

          {/* Password + strength bar */}
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

          {/* Confirm password + match badge */}
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
      </section>

      {/* ── 3. Store Location ───────────────────────────── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <SectionHeading
          step={3}
          icon={MapPin}
          title="Store location"
          description="Where is your business located?"
        />
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {/* Row 1: Region | City — always adjacent */}
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
            key={values.region || '__no-region__'}
            id="city_or_town"
            name="city_or_town"
            label="City or town"
            icon={MapPin}
            options={cityOptions}
            value={values.city_or_town}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.city_or_town && errors.city_or_town}
            disabled={isSubmitting || !values.region}
            placeholder={values.region ? 'Select city…' : 'Select region first'}
            allowCustom
            customPlaceholder="Enter city or town…"
          />

          {/* Row 2: GPS | Physical address (full width) */}
          <FormInput
            id="gps_address"
            name="gps_address"
            label="Digital / GPS address"
            icon={Navigation}
            placeholder="GA-145-4789"
            hint="Ghana Post digital address format"
            value={values.gps_address}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.gps_address && errors.gps_address}
            disabled={isSubmitting}
          />

          {/* Row 3: Physical address — full width */}
          <div className="sm:col-span-2">
            <FormInput
              id="address"
              name="address"
              label="Physical address"
              icon={MapPin}
              placeholder="15 Independence Ave, Osu, Accra"
              value={values.address}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.address && errors.address}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </section>

      {/* ── Submit ──────────────────────────────────────── */}
      <div className="space-y-4 pt-1">
        <button
          type="submit"
          disabled={isSubmitting || registerPending}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting || registerPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Creating account…
            </>
          ) : (
            <>
              Create vendor account
              <ArrowRight className="size-4" />
            </>
          )}
        </button>

        <p className="text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-brand underline-offset-2 transition-colors hover:text-brand-hover hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </Form>
  )
}
