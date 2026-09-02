import { AlertTriangle, BadgeCheck, Ban, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { getVendorKycMeta, getVendorStatusMeta } from '../../constants/vendorsData'

const STATUS_ICONS = {
  'check-circle': CheckCircle2,
  clock: Clock,
  ban: Ban,
  'x-circle': XCircle,
}

const KYC_ICONS = {
  'badge-check': BadgeCheck,
  clock: Clock,
  alert: AlertTriangle,
}

export default function VendorStatusBadge({ status, kyc, compact = false }) {
  if (kyc) {
    const meta = getVendorKycMeta(kyc)
    const Icon = KYC_ICONS[meta.icon] ?? Clock
    return (
      <span className={`inline-flex max-w-full items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${meta.badgeClass}`}>
        <Icon className="size-3 shrink-0" strokeWidth={2.25} aria-hidden="true" />
        {meta.label}
      </span>
    )
  }

  const meta = getVendorStatusMeta(status)
  const Icon = STATUS_ICONS[meta.icon] ?? Clock
  return (
    <span className={`inline-flex max-w-full items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${meta.badgeClass}`}>
      <Icon className="size-3 shrink-0" strokeWidth={2.25} aria-hidden="true" />
      {compact ? (meta.shortLabel ?? meta.label) : meta.label}
    </span>
  )
}
