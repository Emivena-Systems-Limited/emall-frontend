import { Link, useNavigate } from 'react-router'
import {
  ArrowLeft,
  CircleDollarSign,
  Package,
  Store,
} from 'lucide-react'
import DashboardLayout from '../dashboard/DashboardLayout'
import EmptyState from '../dashboard/EmptyState'
import VendorStatusBadge from './VendorStatusBadge'
import VendorActionsMenu from './VendorActionsMenu'
import { getStoreInitials, getVendorAvatarTone } from '../../utils/vendorFilters'
import { parseApiError } from '../../utils/parseApiError'
import { useVendor } from '../../hooks/useAdminVendors'

const LINKS = [
  { key: 'details', label: 'Details', icon: Store, to: (id) => `/vendors/${id}` },
  { key: 'products', label: 'Products', icon: Package, to: (id) => `/vendors/${id}/products` },
  { key: 'sales', label: 'Sales', icon: CircleDollarSign, to: (id) => `/vendors/${id}/sales` },
]

function VendorWorkspaceSkeleton() {
  return (
    <DashboardLayout pageTitle="Vendor">
      <div className="page-enter space-y-5" aria-busy="true" aria-label="Loading vendor">
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:px-6">
          <div className="skeleton-shimmer h-3 w-28 rounded-md" />
          <div className="mt-5 flex items-start gap-4">
            <div className="skeleton-shimmer size-14 shrink-0 rounded-2xl" />
            <div className="space-y-2.5">
              <div className="skeleton-shimmer h-3 w-24 rounded-md" />
              <div className="skeleton-shimmer h-8 w-48 rounded-md" />
              <div className="skeleton-shimmer h-3.5 w-56 rounded-md" />
            </div>
          </div>
        </section>
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5">
          <div className="skeleton-shimmer h-40 w-full rounded-xl" />
        </section>
      </div>
    </DashboardLayout>
  )
}

export default function VendorWorkspace({ vendorId, current, pageTitle, children }) {
  const { vendor, isLoading, isError, error, refetch } = useVendor(vendorId)
  const navigate = useNavigate()

  if (isLoading) return <VendorWorkspaceSkeleton />

  if (isError) {
    return (
      <DashboardLayout pageTitle="Vendor">
        <div className="page-enter">
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
            <EmptyState
              icon={Store}
              title="Could not load this vendor"
              description={parseApiError(error, 'The vendor dossier is unavailable right now.').message}
              action={(
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
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

  if (!vendor) {
    return (
      <DashboardLayout pageTitle="Vendor">
        <div className="page-enter">
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
            <EmptyState
              icon={Store}
              title="This vendor is not on the roster"
              description="The link may be out of date, or this store is no longer returned by the vendor API."
              action={(
                <button
                  type="button"
                  onClick={() => navigate('/vendors')}
                  className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                >
                  Back to vendors
                </button>
              )}
            />
          </section>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout pageTitle={pageTitle ?? vendor.store}>
      <div className="page-enter space-y-5">
        <header className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:px-6">
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-brand" />

          <Link
            to="/vendors"
            className="mb-4 inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-brand"
          >
            <ArrowLeft className="size-3.5" />
            Back to roster
          </Link>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <span className={`flex size-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold ring-1 ${getVendorAvatarTone(vendor.id)}`}>
                {getStoreInitials(vendor.store)}
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
                  Vendor dossier
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-[1.75rem]">
                  {vendor.store}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <p className="text-sm text-slate-500">
                    {vendor.owner}
                    {vendor.city && vendor.city !== '—' ? ` · ${vendor.city}` : ''}
                    {vendor.region && vendor.region !== '—' ? ` · ${vendor.region}` : ''}
                  </p>
                  <VendorStatusBadge status={vendor.status} />
                  <VendorStatusBadge kyc={vendor.kyc} />
                </div>
              </div>
            </div>
            <VendorActionsMenu vendor={vendor} current={current} />
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5 border-t border-slate-100 pt-4">
            {LINKS.map((item) => {
              const Icon = item.icon
              const active = current === item.key
              return (
                <Link
                  key={item.key}
                  to={item.to(vendor.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
                    active
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <Icon className="size-3.5" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </header>

        {typeof children === 'function' ? children(vendor) : children}
      </div>
    </DashboardLayout>
  )
}
