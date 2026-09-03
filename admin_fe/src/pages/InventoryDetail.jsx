import { Link, useNavigate, useParams } from 'react-router'
import {
  Boxes,
  Calendar,
  Clock,
  Package,
  Store,
} from 'lucide-react'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import DashboardReveal from '../components/dashboard/DashboardReveal'
import EmptyState from '../components/dashboard/EmptyState'
import SmartBackButton from '../components/navigation/SmartBackButton'
import SmartBackLink from '../components/navigation/SmartBackLink'
import InventoryIdentity, { InventoryRosterSkeleton } from '../components/inventory/InventoryIdentity'
import InventoryStatusBadge from '../components/inventory/InventoryStatusBadge'
import { getInventoryStatusMeta } from '../constants/inventory'
import { useAdminInventory } from '../hooks/useAdminInventory'
import { formatCount } from '../utils/formatters'
import { formatInventoryDateTime } from '../utils/normalizeAdminInventory'
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

function CountCard({ label, value, hint }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-brand" />
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-slate-950">{value}</p>
      {hint ? <p className="mt-0.5 text-[11px] text-slate-400">{hint}</p> : null}
    </div>
  )
}

function InventoryDetailSkeleton() {
  return (
    <DashboardLayout pageTitle="Inventory">
      <div className="page-enter space-y-5" aria-busy="true" aria-label="Loading stock record">
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
        <InventoryRosterSkeleton rows={4} />
      </div>
    </DashboardLayout>
  )
}

export default function InventoryDetail() {
  const { inventoryId } = useParams()
  const navigate = useNavigate()
  const { item, isLoading, isError, error, refetch } = useAdminInventory(inventoryId)

  if (isLoading) return <InventoryDetailSkeleton />

  if (isError) {
    return (
      <DashboardLayout pageTitle="Inventory">
        <div className="page-enter">
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
            <EmptyState
              icon={Boxes}
              title="Could not load this stock record"
              description={parseApiError(error, 'This inventory record is unavailable right now.').message}
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

  if (!item) {
    return (
      <DashboardLayout pageTitle="Inventory">
        <div className="page-enter">
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
            <EmptyState
              icon={Boxes}
              title="This stock record is not on the list"
              description="The link may be out of date, or this inventory row is no longer returned by the API."
              action={(
                <SmartBackButton
                  fallback="/inventory"
                  fallbackLabel="Back to inventory"
                  className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                />
              )}
            />
          </section>
        </div>
      </DashboardLayout>
    )
  }

  const statusMeta = getInventoryStatusMeta(item.status)

  return (
    <DashboardLayout pageTitle={item.productName || 'Inventory'}>
      <div className="page-enter space-y-5">
        <DashboardReveal index={0}>
          <header className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:px-6">
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-brand" />

            <SmartBackLink
              fallback="/inventory"
              fallbackLabel="Back to inventory"
              variant="text-subtle"
              iconClassName="size-3.5"
              className="mb-4 inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-brand"
            />

            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
                  Stock record
                </p>
                <div className="mt-3">
                  <InventoryIdentity item={item} size="lg" />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <InventoryStatusBadge status={item.status} />
                  <p className="text-sm text-slate-500">{statusMeta.hint}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {item.productId ? (
                  <Link
                    to={`/products/${encodeURIComponent(item.productId)}`}
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:border-brand/40 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                  >
                    <Package className="size-3.5" />
                    Open listing
                  </Link>
                ) : null}
                {item.vendorId ? (
                  <Link
                    to={`/vendors/${encodeURIComponent(item.vendorId)}`}
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:border-brand/40 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                  >
                    <Store className="size-3.5" />
                    Open store
                  </Link>
                ) : null}
              </div>
            </div>
          </header>
        </DashboardReveal>

        <DashboardReveal index={1}>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <CountCard
              label="On hand"
              value={formatCount(item.quantity)}
              hint="Units currently in stock"
            />
            <CountCard
              label="Reserved"
              value={formatCount(item.reserved)}
              hint="Held for open orders"
            />
            <CountCard
              label="Available"
              value={formatCount(item.available)}
              hint="On hand minus reserved"
            />
            <CountCard
              label="Alert level"
              value={item.threshold != null ? formatCount(item.threshold) : 'Not set'}
              hint="Low-stock warning kicks in at this count"
            />
          </div>
        </DashboardReveal>

        <DashboardReveal index={2}>
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
            <div className="border-b border-slate-100 px-5 py-3.5">
              <h3 className="text-sm font-bold text-slate-900">Details</h3>
              <p className="text-xs text-slate-500">Listing, option, and store for this stock row</p>
            </div>
            <div className="divide-y divide-slate-100 px-5">
              <FactRow icon={Package} label="Listing">
                {item.productId ? (
                  <Link to={`/products/${encodeURIComponent(item.productId)}`} className="text-brand hover:underline">
                    {item.productName}
                  </Link>
                ) : item.productName}
              </FactRow>
              <FactRow icon={Boxes} label="Option">
                {item.variantName || 'Standard option'}
                {item.sku ? (
                  <p className="mt-0.5 text-xs font-normal text-slate-500">{item.sku}</p>
                ) : null}
              </FactRow>
              {item.vendorName || item.vendorId ? (
                <FactRow icon={Store} label="Store">
                  {item.vendorId ? (
                    <Link to={`/vendors/${encodeURIComponent(item.vendorId)}`} className="text-brand hover:underline">
                      {item.vendorName || 'Store'}
                    </Link>
                  ) : item.vendorName}
                </FactRow>
              ) : null}
              {item.createdAt ? (
                <FactRow icon={Calendar} label="Created">{formatInventoryDateTime(item.createdAt)}</FactRow>
              ) : null}
              {item.updatedAt ? (
                <FactRow icon={Clock} label="Last updated">{formatInventoryDateTime(item.updatedAt)}</FactRow>
              ) : null}
            </div>
          </section>
        </DashboardReveal>
      </div>
    </DashboardLayout>
  )
}
