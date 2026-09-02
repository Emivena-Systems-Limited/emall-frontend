import { Link, useParams } from 'react-router'
import { useState } from 'react'
import {
  BadgeCheck,
  Ban,
  Building2,
  Clock,
  FileText,
  Hash,
  Mail,
  MapPin,
  Package,
  Pencil,
  Phone,
  RotateCcw,
  Star,
  Store,
} from 'lucide-react'
import VendorWorkspace from '../components/vendors/VendorWorkspace'
import VendorStatusBadge from '../components/vendors/VendorStatusBadge'
import VendorStatusModal from '../components/vendors/VendorStatusModal'
import VendorSuspendModal from '../components/vendors/VendorSuspendModal'
import { formatCount } from '../utils/formatters'
import { formatPhoneDisplay } from '../utils/phoneUtils'
import { formatDateTime, formatJoinedDate } from '../utils/vendorFilters'

function FactRow({ icon: Icon, label, children }) {
  return (
    <div className="flex gap-3 py-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 ring-1 ring-slate-200">
        <Icon className="size-3.5" strokeWidth={2} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <div className="mt-0.5 text-sm font-medium break-words text-slate-900">{children}</div>
      </div>
    </div>
  )
}

function SnapshotRow({ icon: Icon, label, value, hint }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 ring-1 ring-slate-200">
        <Icon className="size-3.5" strokeWidth={2} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        {hint ? <p className="text-[11px] text-slate-400">{hint}</p> : null}
      </div>
      <p className="shrink-0 text-base font-bold tabular-nums tracking-tight text-slate-950">{value}</p>
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <p className="pt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 first:pt-0">
      {children}
    </p>
  )
}

function formatIdNumber(value, prefix) {
  const text = String(value ?? '').trim()
  if (!text) return '—'
  return new RegExp(`^${prefix}`, 'i').test(text) ? text : `${prefix} ${text}`
}

export default function VendorDetail() {
  const { vendorId } = useParams()
  const [statusOpen, setStatusOpen] = useState(false)
  const [suspendOpen, setSuspendOpen] = useState(false)

  return (
    <VendorWorkspace vendorId={vendorId} current="details">
      {(vendor) => {
        const hasNote = Boolean(vendor.rejectionReason || vendor.note)
        const ratingLabel = vendor.reviewsCount > 0 && vendor.rating != null
          ? vendor.rating.toFixed(1)
          : '—'
        const isSuspended = vendor.status === 'suspended'
        const location = [vendor.city, vendor.region, vendor.country]
          .filter((value) => value && value !== '—')
          .join(', ')
        const addressParts = [vendor.street, vendor.fullAddress, vendor.landmark, vendor.gpsAddress]
          .filter((value, index, list) => value && value !== '—' && list.indexOf(value) === index)

        return (
          <div className="grid items-start gap-4 lg:grid-cols-5">
            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)] lg:col-span-3">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Store profile</h3>
                  <p className="text-xs text-slate-500">{vendor.owner}</p>
                </div>
                <VendorStatusBadge status={vendor.status} />
              </div>

              <div className="divide-y divide-slate-100 px-5">
                <div>
                  <SectionLabel>Identity</SectionLabel>
                  <FactRow icon={Store} label="Store">{vendor.store}</FactRow>
                  <FactRow icon={Building2} label="Legal name">{vendor.businessName || '—'}</FactRow>
                  {vendor.tradingName && vendor.tradingName !== vendor.store && (
                    <FactRow icon={Building2} label="Trading as">{vendor.tradingName}</FactRow>
                  )}
                </div>

                <div>
                  <SectionLabel>Contact</SectionLabel>
                  <FactRow icon={Mail} label="Email">
                    {vendor.email ? (
                      <a href={`mailto:${vendor.email}`} className="text-slate-900 transition-colors hover:text-brand">
                        {vendor.email}
                      </a>
                    ) : '—'}
                    <p className={`mt-0.5 text-xs font-medium ${vendor.emailVerifiedAt ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {vendor.emailVerifiedAt ? `Verified ${formatJoinedDate(vendor.emailVerifiedAt)}` : 'Not verified'}
                    </p>
                  </FactRow>
                  <FactRow icon={Phone} label="Phone">
                    {vendor.phone ? (
                      <a href={`tel:+${String(vendor.phone).replace(/\D/g, '')}`} className="text-slate-900 transition-colors hover:text-brand">
                        {formatPhoneDisplay(vendor.phone)}
                      </a>
                    ) : '—'}
                    <p className={`mt-0.5 text-xs font-medium ${vendor.phoneVerifiedAt ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {vendor.phoneVerifiedAt ? `Verified ${formatJoinedDate(vendor.phoneVerifiedAt)}` : 'Not verified'}
                    </p>
                  </FactRow>
                </div>

                <div className="pb-1">
                  <SectionLabel>Address</SectionLabel>
                  <FactRow icon={MapPin} label="Location">
                    <p>{location || '—'}</p>
                    {addressParts.length > 0 && (
                      <ul className="mt-1 space-y-0.5 text-xs font-medium text-slate-500">
                        {addressParts.map((part) => (
                          <li key={part}>{part}</li>
                        ))}
                      </ul>
                    )}
                  </FactRow>
                </div>
              </div>

              {hasNote && (
                <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {vendor.rejectionReason ? 'Status reason' : 'Operator note'}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    {vendor.rejectionReason || vendor.note}
                  </p>
                </div>
              )}
            </section>

            <aside className="space-y-4 lg:col-span-2">
              <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
                <h3 className="text-sm font-bold text-slate-900">Snapshot</h3>
                <div className="mt-1 divide-y divide-slate-100">
                  <SnapshotRow
                    icon={Package}
                    label="Listings"
                    value={formatCount(vendor.listings)}
                  />
                  <SnapshotRow
                    icon={Star}
                    label="Rating"
                    value={ratingLabel}
                    hint={vendor.reviewsCount > 0 ? `${formatCount(vendor.reviewsCount)} reviews` : 'No reviews yet'}
                  />
                  <SnapshotRow
                    icon={BadgeCheck}
                    label="Reviews"
                    value={formatCount(vendor.reviewsCount)}
                  />
                  <SnapshotRow
                    icon={Clock}
                    label="Last login"
                    value={vendor.lastLoginAt ? formatJoinedDate(vendor.lastLoginAt) : 'Never'}
                    hint={vendor.lastLoginAt ? formatDateTime(vendor.lastLoginAt) : undefined}
                  />
                </div>
              </section>

              <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
                <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Actions</p>
                <div className="mt-3 grid gap-2">
                  <button
                    type="button"
                    onClick={() => setStatusOpen(true)}
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:border-brand/40 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                  >
                    <Pencil className="size-3.5" />
                    Update account
                  </button>
                  <Link
                    to={`/vendors/${vendor.id}/products`}
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:border-brand/40 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                  >
                    <Package className="size-3.5" />
                    View products
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSuspendOpen(true)}
                    className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
                      isSuspended
                        ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                        : 'border border-rose-200 bg-white text-rose-700 hover:bg-rose-50'
                    }`}
                  >
                    {isSuspended ? <RotateCcw className="size-3.5" /> : <Ban className="size-3.5" />}
                    {isSuspended ? 'Reinstate store' : 'Suspend store'}
                  </button>
                </div>
              </section>
            </aside>

            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)] lg:col-span-5">
              <div className="border-b border-slate-100 px-5 py-3.5">
                <h3 className="text-sm font-bold text-slate-900">Compliance</h3>
                <p className="text-xs text-slate-500">KYC and registration details on file</p>
              </div>
              <div className="grid divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                <div className="px-5">
                  <FactRow icon={BadgeCheck} label="KYC">
                    <VendorStatusBadge kyc={vendor.kyc} />
                  </FactRow>
                </div>
                <div className="px-5">
                  <FactRow icon={FileText} label="Business registration">
                    {formatIdNumber(vendor.businessRegistrationNumber, 'BN')}
                  </FactRow>
                </div>
                <div className="px-5">
                  <FactRow icon={Hash} label="TIN">
                    {formatIdNumber(vendor.tinNumber, 'TIN')}
                  </FactRow>
                </div>
              </div>
            </section>

            {vendor.documents?.length > 0 && (
              <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)] lg:col-span-5">
                <div className="border-b border-slate-100 px-5 py-3.5">
                  <h3 className="text-sm font-bold text-slate-900">Documents</h3>
                  <p className="text-xs text-slate-500">Files returned with this vendor record</p>
                </div>
                <ul className="divide-y divide-slate-100">
                  {vendor.documents.map((document) => (
                    <li key={document.id} className="flex items-center gap-3 px-5 py-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 ring-1 ring-slate-200">
                        <FileText className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">{document.name}</p>
                        {document.type ? <p className="truncate text-xs text-slate-500">{document.type}</p> : null}
                      </div>
                      {document.url ? (
                        <a
                          href={document.url}
                          target="_blank"
                          rel="noreferrer"
                          className="cursor-pointer text-xs font-semibold text-brand hover:text-brand-hover"
                        >
                          Open
                        </a>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <VendorStatusModal
              open={statusOpen}
              vendor={vendor}
              onClose={() => setStatusOpen(false)}
              onRequestSuspend={() => setSuspendOpen(true)}
            />
            <VendorSuspendModal
              open={suspendOpen}
              vendor={vendor}
              onClose={() => setSuspendOpen(false)}
            />
          </div>
        )
      }}
    </VendorWorkspace>
  )
}
