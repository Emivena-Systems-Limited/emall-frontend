import { Link, useNavigate, useParams } from 'react-router'
import { useState } from 'react'
import {
  Award,
  Calendar,
  Clock,
  Pencil,
  Shield,
  Trash2,
} from 'lucide-react'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import DashboardReveal from '../components/dashboard/DashboardReveal'
import EmptyState from '../components/dashboard/EmptyState'
import SmartBackButton from '../components/navigation/SmartBackButton'
import SmartBackLink from '../components/navigation/SmartBackLink'
import BrandFormDrawer from '../components/brands/BrandFormDrawer'
import BrandIdentity, { BrandRosterSkeleton } from '../components/brands/BrandIdentity'
import BrandRemoveModal from '../components/brands/BrandRemoveModal'
import BrandStatusBadge from '../components/brands/BrandStatusBadge'
import BrandStatusModal from '../components/brands/BrandStatusModal'
import { getBrandStatusMeta } from '../constants/brands'
import { useBrand } from '../hooks/useAdminBrands'
import { formatBrandDate } from '../utils/normalizeAdminBrands'
import { parseApiError } from '../utils/parseApiError'

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

function BrandDetailSkeleton() {
  return (
    <DashboardLayout pageTitle="Brand">
      <div className="page-enter space-y-5" aria-busy="true" aria-label="Loading brand">
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:px-6">
          <div className="skeleton-shimmer h-3 w-28 rounded-md" />
          <div className="mt-5 flex items-start gap-4">
            <div className="skeleton-shimmer size-16 shrink-0 rounded-2xl" />
            <div className="space-y-2.5">
              <div className="skeleton-shimmer h-3 w-24 rounded-md" />
              <div className="skeleton-shimmer h-8 w-48 rounded-md" />
              <div className="skeleton-shimmer h-3.5 w-56 rounded-md" />
            </div>
          </div>
        </section>
        <BrandRosterSkeleton rows={4} />
      </div>
    </DashboardLayout>
  )
}

export default function BrandDetail() {
  const { brandId } = useParams()
  const navigate = useNavigate()
  const { brand, isLoading, isError, error, refetch } = useBrand(brandId)
  const [editing, setEditing] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [removing, setRemoving] = useState(false)

  if (isLoading) return <BrandDetailSkeleton />

  if (isError) {
    return (
      <DashboardLayout pageTitle="Brand">
        <div className="page-enter">
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
            <EmptyState
              icon={Award}
              title="Could not load this brand"
              description={parseApiError(error, 'This brand is unavailable right now.').message}
              action={(
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  Try again
                </button>
              )}
            />
          </section>
        </div>
      </DashboardLayout>
    )
  }

  if (!brand) {
    return (
      <DashboardLayout pageTitle="Brand">
        <div className="page-enter">
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
            <EmptyState
              icon={Award}
              title="This brand is not on the list"
              description="The link may be out of date, or this label is no longer returned by the API."
              action={(
                <SmartBackButton
                  fallback="/brands"
                  fallbackLabel="Back to brands"
                  className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                />
              )}
            />
          </section>
        </div>
      </DashboardLayout>
    )
  }

  const statusMeta = getBrandStatusMeta(brand.status)

  return (
    <DashboardLayout pageTitle={brand.name}>
      <div className="page-enter space-y-5">
        <DashboardReveal index={0}>
          <header className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:px-6">
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-brand" />

            <SmartBackLink
              fallback="/brands"
              fallbackLabel="Back to brands"
              variant="text-subtle"
              iconClassName="size-3.5"
              className="mb-4 inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-brand"
            />

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
                  Brand
                </p>
                <div className="mt-3">
                  <BrandIdentity brand={brand} size="lg" />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <BrandStatusBadge status={brand.status} />
                  <p className="text-sm text-slate-500">{statusMeta.hint}</p>
                </div>
              </div>
            </div>
          </header>
        </DashboardReveal>

        <div className="grid items-start gap-4 lg:grid-cols-5">
          <DashboardReveal index={1} className="lg:col-span-3">
            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
              <div className="border-b border-slate-100 px-5 py-3.5">
                <h3 className="text-sm font-bold text-slate-900">Profile</h3>
                <p className="text-xs text-slate-500">How this label appears in the catalogue</p>
              </div>
              <div className="divide-y divide-slate-100 px-5">
                <FactRow icon={Award} label="Name">{brand.name}</FactRow>
                <FactRow icon={Shield} label="Status">
                  <div className="flex flex-wrap items-center gap-2">
                    <BrandStatusBadge status={brand.status} />
                    <span className="text-slate-500">{statusMeta.helper}</span>
                  </div>
                </FactRow>
                <FactRow icon={Calendar} label="Added">{formatBrandDate(brand.createdAt)}</FactRow>
                {brand.updatedAt && brand.updatedAt !== brand.createdAt ? (
                  <FactRow icon={Clock} label="Last updated">{formatBrandDate(brand.updatedAt)}</FactRow>
                ) : null}
              </div>
            </section>
          </DashboardReveal>

          <DashboardReveal index={2} className="lg:col-span-2">
            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
              <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Actions</p>
              <div className="mt-3 grid gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:border-brand/40 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  <Pencil className="size-3.5" />
                  Rename brand
                </button>
                <button
                  type="button"
                  onClick={() => setStatusOpen(true)}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:border-brand/40 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  <Shield className="size-3.5" />
                  Update status
                </button>
                <button
                  type="button"
                  onClick={() => setRemoving(true)}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  <Trash2 className="size-3.5" />
                  Remove brand
                </button>
              </div>
            </section>
          </DashboardReveal>
        </div>
      </div>

      <BrandFormDrawer
        open={editing}
        mode="edit"
        brand={brand}
        onClose={() => setEditing(false)}
      />
      <BrandStatusModal
        open={statusOpen}
        brand={brand}
        onClose={() => setStatusOpen(false)}
      />
      <BrandRemoveModal
        open={removing}
        brand={brand}
        onClose={() => setRemoving(false)}
        onRemoved={() => navigate('/brands', { replace: true })}
      />
    </DashboardLayout>
  )
}
