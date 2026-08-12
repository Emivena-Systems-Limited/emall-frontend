import { ShieldCheck } from 'lucide-react'
import { VERIFICATION_ITEMS } from '../../constants/profile'
import { PROFILE_INNER_SURFACE_CLASS } from '../../constants/profile'
import { getVerificationItemMeta } from '../../utils/profileFormUtils'
import ProfileSectionCard from './ProfileSectionCard'

const VERIFICATION_COPY = {
  identity: {
    verified: 'Your identity has been verified.',
    pending: 'Your identity documents are being reviewed.',
    not_verified: 'Upload an identity document to verify your account.',
  },
  business: {
    verified: 'Your business details have been verified.',
    pending: 'Your business registration is under review.',
    not_verified: 'Complete business verification to unlock full access.',
  },
  address: {
    verified: 'Your address has been verified.',
    pending: 'Your proof of address is being reviewed.',
    not_verified: 'Provide proof of address to complete verification.',
  },
}

export default function BusinessVerificationSection({ verification = {} }) {
  return (
    <ProfileSectionCard
      icon={ShieldCheck}
      title="Business Verification"
      subtitle="Track verification progress for your vendor account."
    >
      <ul className="space-y-3">
        {VERIFICATION_ITEMS.map((item) => {
          const status = verification[item.key] ?? 'not_verified'
          const meta = getVerificationItemMeta(status)
          const description = VERIFICATION_COPY[item.key]?.[status] ?? meta.description

          return (
            <li
              key={item.key}
              className={`flex flex-col gap-3 ${PROFILE_INNER_SURFACE_CLASS} px-4 py-3 sm:flex-row sm:items-center sm:justify-between`}
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="mt-0.5 text-xs text-slate-500">{description}</p>
              </div>
              <span
                className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${meta.className}`}
              >
                <span className={`size-2 rounded-full ${meta.dotClass}`} aria-hidden="true" />
                {meta.label}
              </span>
            </li>
          )
        })}
      </ul>
    </ProfileSectionCard>
  )
}
