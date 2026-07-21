import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CircleDollarSign,
  Hash,
  KeyRound,
  Mail,
  Phone,
  Save,
  Settings,
  Shield,
  ShieldCheck,
  User,
  UserCog,
} from 'lucide-react'
import DevDataToggle from '../dev/DevDataToggle'
import { PROFILE_QUICK_LINKS } from '../../constants/profile'
import {
  formatProfileDate,
  getAccountStatusMeta,
  getProfileDisplayName,
  getProfileInitials,
  getProfileRoleLabel,
  isProfileComplete,
  mapUserToProfileForm,
} from '../../utils/profileUtils'

function VerificationBadge({ verified, label }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${
        verified
          ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
          : 'bg-amber-50 text-amber-700 ring-amber-100'
      }`}
    >
      {verified ? <BadgeCheck className="size-3.5" /> : <Shield className="size-3.5" />}
      {label}
    </span>
  )
}

function ProfileFieldLabel({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold text-slate-600">
      {children}
    </label>
  )
}

function ProfileTextInput({ id, value, onChange, placeholder, type = 'text', disabled = false }) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand-light ${
        disabled
          ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-500'
          : 'border-slate-200 bg-white text-slate-900'
      }`}
    />
  )
}

function SectionCard({ icon: Icon, title, subtitle, children, footer }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
            <Icon className="size-4" strokeWidth={2} />
          </span>
          <div>
            <h2 className="text-sm font-bold text-slate-900">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{subtitle}</p>}
          </div>
        </div>
      </div>
      <div className="px-5 py-5 sm:px-6">{children}</div>
      {footer && <div className="border-t border-slate-100 px-5 py-4 sm:px-6">{footer}</div>}
    </section>
  )
}

function ProfileHeroCard({ user }) {
  const displayName = getProfileDisplayName(user)
  const role = getProfileRoleLabel(user)
  const storeLabel = user?.store_name ?? user?.business_name ?? user?.trading_name ?? ''
  const initials = getProfileInitials(user)
  const statusMeta = getAccountStatusMeta(user?.status)
  const emailVerified = Boolean(user?.email_verified_at)
  const phoneVerified = Boolean(user?.phone_verified_at)

  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_55px_rgba(15,23,42,0.06)]">
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-br from-brand-light via-white to-cyan-50/80" />
      <div className="relative px-5 pb-5 pt-6 sm:px-6 sm:pb-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 items-end gap-4">
            <span className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-brand text-2xl font-bold text-white shadow-[0_16px_40px_rgba(199,59,45,0.28)] ring-4 ring-white">
              {initials}
            </span>
            <div className="min-w-0 pb-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand/70">
                Your account
              </p>
              <h2 className="truncate text-xl font-bold text-slate-950 sm:text-2xl">{displayName}</h2>
              <p className="mt-0.5 text-sm font-semibold text-slate-600">{role}</p>
              {storeLabel && (
                <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-500">
                  <Building2 className="size-3.5 shrink-0" />
                  {storeLabel}
                </p>
              )}
              {user?.email && (
                <p className="mt-1 truncate text-xs text-slate-400">{user.email}</p>
              )}
            </div>
          </div>

          <span
            className={`inline-flex w-fit items-center gap-1.5 self-start rounded-full px-3 py-1.5 text-xs font-bold ring-1 sm:self-auto ${statusMeta.badgeClass}`}
          >
            <span className={`size-2 rounded-full ${statusMeta.dotClass}`} />
            {statusMeta.label}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <VerificationBadge verified={emailVerified} label={emailVerified ? 'Email verified' : 'Email not verified'} />
          <VerificationBadge verified={phoneVerified} label={phoneVerified ? 'Phone verified' : 'Phone not verified'} />
        </div>
      </div>
    </section>
  )
}

function PersonalDetailsSection({ form, errors, onChange, onSave, isSaving }) {
  return (
    <SectionCard
      icon={User}
      title="Personal details"
      subtitle="Your name and contact info as the store administrator — separate from customer-facing store settings."
      footer={(
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(15,23,42,0.18)] transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="size-4" />
            {isSaving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      )}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <ProfileFieldLabel htmlFor="admin_full_name">Full name</ProfileFieldLabel>
          <ProfileTextInput
            id="admin_full_name"
            value={form.admin_full_name}
            onChange={(e) => onChange('admin_full_name', e.target.value)}
            placeholder="e.g. Kwame Adom Mensah"
          />
          {errors.admin_full_name && (
            <p className="mt-1.5 text-xs font-medium text-red-600">{errors.admin_full_name}</p>
          )}
        </div>
        <div>
          <ProfileFieldLabel htmlFor="phone_number">Phone number</ProfileFieldLabel>
          <ProfileTextInput
            id="phone_number"
            value={form.phone_number}
            onChange={(e) => onChange('phone_number', e.target.value)}
            placeholder="+233 XX XXX XXXX"
          />
          {errors.phone_number && (
            <p className="mt-1.5 text-xs font-medium text-red-600">{errors.phone_number}</p>
          )}
        </div>
        <div>
          <ProfileFieldLabel htmlFor="email">Login email</ProfileFieldLabel>
          <ProfileTextInput
            id="email"
            type="email"
            value={form.email}
            disabled
          />
          <p className="mt-1.5 text-[11px] text-slate-400">
            Email changes require support verification for security.
          </p>
        </div>
      </div>
    </SectionCard>
  )
}

function SecuritySection({ user }) {
  const emailVerified = Boolean(user?.email_verified_at)
  const phoneVerified = Boolean(user?.phone_verified_at)

  return (
    <SectionCard
      icon={ShieldCheck}
      title="Security"
      subtitle="Keep your account secure and your contact methods verified."
    >
      <div className="space-y-3">
        <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
          <Mail className="mt-0.5 size-4 shrink-0 text-slate-400" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-800">Email verification</p>
            <p className="mt-0.5 truncate text-xs text-slate-500">{user?.email ?? 'No email on file'}</p>
          </div>
          <VerificationBadge verified={emailVerified} label={emailVerified ? 'Verified' : 'Pending'} />
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
          <Phone className="mt-0.5 size-4 shrink-0 text-slate-400" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-800">Phone verification</p>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {user?.phone_number ?? 'Add a phone number in personal details'}
            </p>
          </div>
          <VerificationBadge verified={phoneVerified} label={phoneVerified ? 'Verified' : 'Pending'} />
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <KeyRound className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-800">Password</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Reset via a one-time code sent to your login email.
              </p>
            </div>
          </div>
          <Link
            to="/forgot-password"
            className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            Change password
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </SectionCard>
  )
}

function AccountDetailsSection({ user }) {
  const vendorId = user?.vendor_id ?? user?.id ?? '—'
  const role = getProfileRoleLabel(user)
  const statusMeta = getAccountStatusMeta(user?.status)

  return (
    <SectionCard
      icon={Hash}
      title="Account details"
      subtitle="Read-only identifiers for your vendor account on E-Mall."
    >
      <dl className="grid gap-3 sm:grid-cols-2">
        {[
          { label: 'Vendor ID', value: vendorId },
          { label: 'Role', value: role },
          { label: 'Account status', value: statusMeta.label },
          { label: 'Member since', value: formatProfileDate(user?.created_at) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3">
            <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">{value}</dd>
          </div>
        ))}
      </dl>
    </SectionCard>
  )
}

const QUICK_LINK_ICONS = {
  '/settings': Settings,
  '/finance': CircleDollarSign,
  '/users': UserCog,
}

function RelatedLinksSection() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:p-6">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-slate-900">Related settings</h2>
        <p className="mt-1 text-xs text-slate-500">
          Profile is your personal account. Store configuration, payouts, and team access live elsewhere.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {PROFILE_QUICK_LINKS.map((link) => {
          const Icon = QUICK_LINK_ICONS[link.to] ?? Settings
          return (
            <Link
              key={link.to}
              to={link.to}
              className="group flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
            >
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-slate-100"
                style={{ background: `${link.accent}14` }}
              >
                <Icon className="size-4" style={{ color: link.accent }} strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">{link.label}</p>
                <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-slate-500">
                  {link.description}
                </p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export default function ProfilePageHeader({ complete, devDataEnabled, onDevDataChange }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your personal account, contact details, and security — separate from your storefront settings.
        </p>
        {complete && (
          <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
            Profile complete
          </p>
        )}
      </div>
      <DevDataToggle
        enabled={devDataEnabled}
        onChange={onDevDataChange}
        ariaLabel="Toggle dummy profile data"
      />
    </div>
  )
}

export function ProfilePanel({
  user,
  form,
  errors,
  onFieldChange,
  onSave,
  isSaving,
}) {
  return (
    <div className="space-y-6">
      <ProfileHeroCard user={user} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <PersonalDetailsSection
          form={form}
          errors={errors}
          onChange={onFieldChange}
          onSave={onSave}
          isSaving={isSaving}
        />
        <div className="space-y-6">
          <SecuritySection user={user} />
          <AccountDetailsSection user={user} />
        </div>
      </div>

      <RelatedLinksSection />
    </div>
  )
}

export function useProfileForm(user) {
  const [form, setForm] = useState(() => mapUserToProfileForm(user))
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setForm(mapUserToProfileForm(user))
    setErrors({})
  }, [user])

  const validate = () => {
    const nextErrors = {}
    const name = form.admin_full_name.trim()
    const phone = form.phone_number.trim()

    if (name.length < 3) {
      nextErrors.admin_full_name = 'Enter your full name (at least 3 characters)'
    }
    if (!phone) {
      nextErrors.phone_number = 'Phone number is required'
    } else {
      const digits = phone.replace(/\D/g, '')
      if (!(digits.startsWith('0') && digits.length === 10)) {
        nextErrors.phone_number = 'Enter a valid 10-digit Ghanaian mobile number starting with 0'
      }
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleFieldChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    if (errors[field]) {
      setErrors((current) => {
        const next = { ...current }
        delete next[field]
        return next
      })
    }
  }

  return { form, errors, validate, handleFieldChange }
}

export function useProfileUser(authUser, devDataEnabled, devFields) {
  return useMemo(() => {
    if (!devDataEnabled) return authUser
    return { ...authUser, ...devFields }
  }, [authUser, devDataEnabled, devFields])
}

export { isProfileComplete }
