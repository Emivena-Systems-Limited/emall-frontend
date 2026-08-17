import { BadgeCheck, AlertCircle, Clock3, ExternalLink, Mail, MapPin, Phone, Star } from 'lucide-react'
import { PROFILE_SURFACE_CLASS } from '../../constants/profile'
import ProfileAvatar from './ProfileAvatar'
import {
  formatPhoneDisplay,
  formatProfileDate,
  getOverallVerificationMeta,
  getProfileDisplayName,
  getProfileRoleDescription,
  getProfileRoleLabel,
} from '../../utils/profileFormUtils'

function VerificationStatusBadge({ status }) {
  const meta = getOverallVerificationMeta(status)

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${meta.className}`}>
      {meta.icon === 'check' && <BadgeCheck className="size-3.5" aria-hidden="true" />}
      {meta.icon === 'pending' && <Clock3 className="size-3.5" aria-hidden="true" />}
      {meta.icon === 'alert' && <AlertCircle className="size-3.5" aria-hidden="true" />}
      {meta.label}
    </span>
  )
}

export default function ProfileOverview({
  profile,
  onUploadPicture,
  onRemovePicture,
  isUploadingPicture = false,
  isRemovingPicture = false,
}) {
  const displayName = getProfileDisplayName(profile)
  const roleLabel = getProfileRoleLabel(profile)
  const roleDescription = getProfileRoleDescription(profile)

  const handleViewStore = () => {
    // TODO: Connect View Store action to vendor storefront route.
    window.alert('Storefront preview will be available once the vendor storefront route is connected.')
  }

  return (
    <section className={`relative ${PROFILE_SURFACE_CLASS}`}>
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-brand-light via-white to-cyan-50/80" />
      <div className="relative px-5 py-6 sm:px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <ProfileAvatar
              profile={profile}
              onUpload={onUploadPicture}
              onRemove={onRemovePicture}
              isUploading={isUploadingPicture}
              isRemoving={isRemovingPicture}
            />

            <div className="min-w-0 space-y-3">
              <div>
                <h2 className="text-xl font-bold text-slate-950 sm:text-2xl">{displayName}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                    {roleLabel}
                  </span>
                  <VerificationStatusBadge status={profile?.verificationStatus} />
                </div>
                {roleDescription && (
                  <p className="mt-1 text-xs text-slate-500">{roleDescription}</p>
                )}
              </div>

              <dl className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-2.5">
                  <Mail className="mt-0.5 size-4 shrink-0 text-slate-400" />
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Email</dt>
                    <dd className="text-sm font-semibold text-slate-800">{profile?.email ?? '—'}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Phone className="mt-0.5 size-4 shrink-0 text-slate-400" />
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Phone</dt>
                    <dd className="text-sm font-semibold text-slate-800">{formatPhoneDisplay(profile?.phone)}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-slate-400" />
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Location</dt>
                    <dd className="text-sm font-semibold text-slate-800">{profile?.location ?? '—'}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock3 className="mt-0.5 size-4 shrink-0 text-slate-400" />
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Joined</dt>
                    <dd className="text-sm font-semibold text-slate-800">
                      {formatProfileDate(profile?.dateJoined, { monthYear: true })}
                    </dd>
                  </div>
                </div>
              </dl>
            </div>
          </div>

          <button
            type="button"
            onClick={handleViewStore}
            className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 self-start rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200/80 transition-colors hover:bg-slate-50"
          >
            View Store
            <ExternalLink className="size-4" />
          </button>
        </div>
      </div>
    </section>
  )
}

export function AccountSummaryCards({ summary }) {
  const cards = [
    { label: 'Products Listed', value: summary?.productsListed?.toLocaleString('en-GH') ?? '—' },
    { label: 'Total Orders', value: summary?.totalOrders?.toLocaleString('en-GH') ?? '—' },
    {
      label: 'Average Rating',
      value: summary?.averageRating != null ? (
        <span className="inline-flex items-center gap-1">
          <Star className="size-4 fill-amber-400 text-amber-400" />
          {Number(summary.averageRating).toFixed(1)}
        </span>
      ) : '—',
    },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`${PROFILE_SURFACE_CLASS} px-4 py-4`}
        >
          <p className="text-2xl font-bold text-slate-950">{card.value}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">{card.label}</p>
        </div>
      ))}
    </div>
  )
}
