import { useEffect, useMemo, useRef, useState } from 'react'
import { Form, Formik } from 'formik'
import {
  Bell,
  Hash,
  KeyRound,
  Loader2,
  Mail,
  Save,
  ShieldCheck,
  User,
} from 'lucide-react'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import FieldError from '../components/auth/FieldError'
import PasswordInput from '../components/auth/PasswordInput'
import InternationalPhoneInput from '../components/profile/InternationalPhoneInput'
import PasswordStrengthBar, { PasswordMatchIndicator } from '../components/profile/PasswordStrengthBar'
import ProfileAvatar from '../components/profile/ProfileAvatar'
import ProfileSectionCard, {
  ProfileFieldLabel,
  ProfileTextInput,
} from '../components/profile/ProfileSectionCard'
import { NOTIFICATION_PREFERENCES } from '../constants/profile'
import { useAdminAvatar } from '../hooks/useAdminAvatar'
import { useAdminProfile } from '../hooks/useAdminProfile'
import notify from '../lib/notify'
import {
  formatPhoneDisplay,
  formatProfileDate,
  getAccountStatusMeta,
  getProfileDisplayName,
  isPlainObjectEqual,
  mapUserToNotificationPreferences,
  mapUserToProfileForm,
  validatePasswordForm,
  validateProfileForm,
} from '../utils/profileUtils'
import { parseApiError } from '../utils/parseApiError'

const SHOW_QUEUE_NOTIFICATIONS = false

function FormErrorSummary({ id, errors, submitCount }) {
  const ref = useRef(null)
  const messages = Object.entries(errors).filter(([, message]) => message)

  useEffect(() => {
    if (submitCount > 0 && messages.length > 0) {
      ref.current?.focus()
    }
  }, [messages.length, submitCount])

  if (submitCount === 0 || messages.length === 0) return null

  return (
    <div
      ref={ref}
      id={id}
      tabIndex={-1}
      role="alert"
      aria-labelledby={`${id}-title`}
      className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-red-300"
    >
      <p id={`${id}-title`} className="text-sm font-bold text-red-700">There is a problem</p>
      <ul className="mt-2 space-y-1">
        {messages.map(([field, message]) => (
          <li key={field}>
            <a
              href={`#${field}`}
              className="text-xs font-medium text-red-700 underline underline-offset-2 hover:text-red-800"
            >
              {message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ProfileHero({ user, onUploadAvatar, onRemoveAvatar, isUploadingAvatar, isRemovingAvatar }) {
  const displayName = getProfileDisplayName(user)

  return (
    <section className="relative rounded-2xl bg-gradient-to-br from-ink via-slate-900 to-slate-950 px-5 py-6 shadow-[0_24px_60px_rgba(15,23,42,0.18)] sm:px-6">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }}
        />
        <div className="absolute -top-10 -right-10 size-52 rounded-full bg-brand/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 size-36 rounded-full bg-cyan-500/10 blur-2xl" />
      </div>

      <div className="relative flex min-w-0 items-center gap-4">
        <ProfileAvatar
          user={user}
          onUpload={onUploadAvatar}
          onRemove={onRemoveAvatar}
          isUploading={isUploadingAvatar}
          isRemoving={isRemovingAvatar}
        />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-cyan-300/80 uppercase">
            Operator account
          </p>
          <h2 className="mt-1 truncate text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {displayName}
          </h2>
          <p className="mt-1.5 truncate text-sm text-white/55">{user?.role ?? 'Admin'}</p>
          {user?.email && (
            <p className="mt-1 truncate text-xs text-white/35">{user.email}</p>
          )}
        </div>
      </div>
    </section>
  )
}

function PersonalDetailsSection({ user, onSave, isSaving }) {
  const baseline = useMemo(() => mapUserToProfileForm(user), [user])

  return (
    <Formik
      enableReinitialize
      initialValues={baseline}
      validate={validateProfileForm}
      validateOnChange={false}
      validateOnBlur
      onSubmit={async (values, { setSubmitting, setFieldError }) => {
        try {
          const result = await onSave(values)
          notify.success(result?.message || 'Profile updated successfully.')
        } catch (error) {
          const { fieldErrors, message } = parseApiError(error)
          if (fieldErrors.first_name) setFieldError('first_name', fieldErrors.first_name)
          if (fieldErrors.last_name) setFieldError('last_name', fieldErrors.last_name)
          if (fieldErrors.phone_number) setFieldError('phone_number', fieldErrors.phone_number)
          notify.fromError(error, message || 'Unable to update your profile. Please try again.')
        } finally {
          setSubmitting(false)
        }
      }}
    >
      {({ values, errors, touched, handleChange, handleBlur, isSubmitting, resetForm, submitCount, setFieldValue, setFieldTouched }) => {
        const dirty = !isPlainObjectEqual(
          {
            first_name: values.first_name,
            last_name: values.last_name,
            phone_number: values.phone_number,
          },
          {
            first_name: baseline.first_name,
            last_name: baseline.last_name,
            phone_number: baseline.phone_number,
          },
        )
        const busy = isSaving || isSubmitting

        return (
          <Form noValidate className="h-full">
            <ProfileSectionCard
              icon={User}
              title="Personal details"
              subtitle="Your operator identity on EZ-Mall. Email changes require a staff invite for security."
              footer={(
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  {dirty && (
                    <button
                      type="button"
                      onClick={() => resetForm({ values: baseline })}
                      disabled={busy}
                      className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Discard
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={busy || !dirty}
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
                    {busy ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              )}
            >
              <FormErrorSummary id="profile-details-errors" errors={errors} submitCount={submitCount} />
              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <ProfileFieldLabel htmlFor="first_name">First name</ProfileFieldLabel>
                    <ProfileTextInput
                      id="first_name"
                      name="first_name"
                      value={values.first_name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. Ama"
                      autoComplete="given-name"
                      error={touched.first_name && errors.first_name}
                      disabled={busy}
                    />
                    <FieldError id="first_name-error" message={touched.first_name && errors.first_name} />
                  </div>
                  <div>
                    <ProfileFieldLabel htmlFor="last_name">Last name</ProfileFieldLabel>
                    <ProfileTextInput
                      id="last_name"
                      name="last_name"
                      value={values.last_name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. Mensah"
                      autoComplete="family-name"
                      error={touched.last_name && errors.last_name}
                      disabled={busy}
                    />
                    <FieldError id="last_name-error" message={touched.last_name && errors.last_name} />
                  </div>
                </div>
                <InternationalPhoneInput
                  id="phone_number"
                  value={values.phone_number}
                  onChange={(next) => setFieldValue('phone_number', next)}
                  onBlur={() => setFieldTouched('phone_number', true)}
                  error={touched.phone_number && errors.phone_number}
                  disabled={busy}
                />
                <div>
                  <ProfileFieldLabel htmlFor="email" hint="read-only">Login email</ProfileFieldLabel>
                  <ProfileTextInput
                    id="email"
                    name="email"
                    type="email"
                    value={values.email}
                    disabled
                    autoComplete="email"
                  />
                  <p className="mt-1.5 text-[11px] text-slate-400">
                    Work email is bound to your staff invite and cannot be changed here.
                  </p>
                </div>
              </div>
            </ProfileSectionCard>
          </Form>
        )
      }}
    </Formik>
  )
}

function AccountDetailsSection({ user }) {
  const statusMeta = getAccountStatusMeta(user?.status)
  const items = [
    { label: 'Operator ID', value: user?.id ?? '—' },
    { label: 'Role', value: user?.role ?? 'Admin' },
    { label: 'Account status', value: statusMeta.label },
    { label: 'Member since', value: formatProfileDate(user?.created_at) },
    { label: 'Last sign-in', value: formatProfileDate(user?.last_login_at, { withTime: true }) },
    { label: 'Phone on file', value: formatPhoneDisplay(user?.phone_number) },
  ]

  return (
    <ProfileSectionCard
      icon={Hash}
      title="Account details"
      subtitle="Read-only identifiers for this operator account."
    >
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {items.map(({ label, value }) => (
          <div key={label} className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3">
            <dt className="text-[10px] font-bold tracking-wide text-slate-400 uppercase">{label}</dt>
            <dd className="mt-1 truncate text-sm font-semibold text-slate-900">{value}</dd>
          </div>
        ))}
      </dl>
    </ProfileSectionCard>
  )
}

function SecuritySection({ user, onChangePassword, isSaving }) {
  return (
    <Formik
      initialValues={{
        current_password: '',
        password: '',
        password_confirmation: '',
      }}
      validate={validatePasswordForm}
      validateOnChange={false}
      validateOnBlur
      onSubmit={async (values, { setSubmitting, setFieldError }) => {
        try {
          await onChangePassword(values)
        } catch (error) {
          const { fieldErrors, message } = parseApiError(error)
          if (fieldErrors.current_password) setFieldError('current_password', fieldErrors.current_password)
          if (fieldErrors.password) setFieldError('password', fieldErrors.password)
          if (fieldErrors.password_confirmation) setFieldError('password_confirmation', fieldErrors.password_confirmation)
          notify.fromError(error, message || 'Unable to change password. Please try again.')
        } finally {
          setSubmitting(false)
        }
      }}
    >
      {({ values, errors, touched, handleChange, handleBlur, isSubmitting, submitCount }) => {
        const busy = isSaving || isSubmitting

        return (
          <Form noValidate className="h-full">
            <ProfileSectionCard
              icon={ShieldCheck}
              title="Security"
              subtitle="Update the password you use to sign in to the command center."
              footer={(
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={busy}
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <KeyRound className="size-4" aria-hidden="true" />}
                    {busy ? 'Updating…' : 'Update password'}
                  </button>
                </div>
              )}
            >
              <FormErrorSummary id="profile-password-errors" errors={errors} submitCount={submitCount} />
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                  <Mail className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">Login email</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{user?.email ?? 'No email on file'}</p>
                  </div>
                </div>

                <PasswordInput
                  id="current_password"
                  name="current_password"
                  label="Current password"
                  autoComplete="current-password"
                  value={values.current_password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.current_password && errors.current_password}
                  disabled={busy}
                />

                <div>
                  <PasswordInput
                    id="password"
                    name="password"
                    label="New password"
                    autoComplete="new-password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.password && errors.password}
                    disabled={busy}
                  />
                  <PasswordStrengthBar password={values.password} />
                </div>

                <div>
                  <PasswordInput
                    id="password_confirmation"
                    name="password_confirmation"
                    label="Confirm new password"
                    autoComplete="new-password"
                    value={values.password_confirmation}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.password_confirmation && errors.password_confirmation}
                    disabled={busy}
                  />
                  <PasswordMatchIndicator
                    password={values.password}
                    confirmation={values.password_confirmation}
                  />
                </div>
              </div>
            </ProfileSectionCard>
          </Form>
        )
      }}
    </Formik>
  )
}

function NotificationPreferencesSection({ user, onSave, isSaving }) {
  const baseline = useMemo(() => mapUserToNotificationPreferences(user), [user])
  const [draft, setDraft] = useState(null)
  const preferences = draft ?? baseline
  const dirty = Boolean(draft) && !isPlainObjectEqual(draft, baseline)

  const handleToggle = (key) => {
    setDraft((current) => {
      const next = { ...(current ?? baseline), [key]: !(current ?? baseline)[key] }
      return next
    })
  }

  const handleSave = async () => {
    try {
      await onSave(preferences)
      setDraft(null)
      notify.success('Notification preferences saved.')
    } catch (error) {
      notify.fromError(error, 'Unable to save notification preferences.')
    }
  }

  return (
    <ProfileSectionCard
      icon={Bell}
      title="Queue notifications"
      subtitle="Choose which command-center queues ping you. These are personal to this operator, not platform-wide."
      footer={(
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-slate-400">
            {dirty ? 'You have unsaved preference changes.' : 'Preferences are up to date.'}
          </p>
          <div className="flex justify-end gap-3">
            {dirty && (
              <button
                type="button"
                onClick={() => setDraft(null)}
                disabled={isSaving}
                className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Discard
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !dirty}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
              {isSaving ? 'Saving…' : 'Save preferences'}
            </button>
          </div>
        </div>
      )}
    >
      <ul className="divide-y divide-slate-100">
        {NOTIFICATION_PREFERENCES.map((item) => {
          const enabled = Boolean(preferences[item.key])
          return (
            <li key={item.key} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{item.description}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                aria-label={item.label}
                onClick={() => handleToggle(item.key)}
                className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
                  enabled ? 'bg-brand' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform ${
                    enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </li>
          )
        })}
      </ul>
    </ProfileSectionCard>
  )
}

export default function Profile() {
  const {
    user,
    updateProfile,
    changePassword,
    updateNotifications,
    isUpdatingProfile,
    isChangingPassword,
    isUpdatingNotifications,
  } = useAdminProfile()
  const {
    uploadAvatar,
    removeAvatar,
    isUploadingAvatar,
    isRemovingAvatar,
  } = useAdminAvatar()

  const handleUploadAvatar = async (file) => {
    await uploadAvatar(file)
    notify.success('Profile picture updated.')
  }

  const handleRemoveAvatar = async () => {
    await removeAvatar()
    notify.success('Profile picture removed.')
  }

  return (
    <DashboardLayout pageTitle="My profile">
      <div className="page-enter space-y-5">
        <ProfileHero
          user={user}
          onUploadAvatar={handleUploadAvatar}
          onRemoveAvatar={handleRemoveAvatar}
          isUploadingAvatar={isUploadingAvatar}
          isRemovingAvatar={isRemovingAvatar}
        />

        <AccountDetailsSection user={user} />

        <div className="grid items-stretch gap-5 lg:grid-cols-2">
          <PersonalDetailsSection
            user={user}
            onSave={updateProfile}
            isSaving={isUpdatingProfile}
          />
          <SecuritySection
            user={user}
            onChangePassword={changePassword}
            isSaving={isChangingPassword}
          />
        </div>

        {SHOW_QUEUE_NOTIFICATIONS && (
          <NotificationPreferencesSection
            user={user}
            onSave={updateNotifications}
            isSaving={isUpdatingNotifications}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
