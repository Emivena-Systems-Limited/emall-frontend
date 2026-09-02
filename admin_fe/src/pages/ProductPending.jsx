import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowLeft, Inbox, Package } from 'lucide-react'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import DashboardReveal from '../components/dashboard/DashboardReveal'
import EmptyState from '../components/dashboard/EmptyState'
import ProductPendingStage from '../components/products/ProductPendingStage'
import { ProductRosterSkeleton } from '../components/products/ProductIdentity'
import { useAdminProductRoster } from '../hooks/useAdminProducts'
import { parseApiError } from '../utils/parseApiError'

export default function ProductPending() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const {
    products,
    pagination,
    isLoading,
    isError,
    error,
    refetch,
  } = useAdminProductRoster({ pendingQueue: true }, page)

  return (
    <DashboardLayout pageTitle="Review desk">
      <div className="page-enter space-y-5">
        <DashboardReveal index={0}>
          <header className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:px-6">
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-brand" />
            <Link
              to="/products"
              className="mb-4 inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-brand"
            >
              <ArrowLeft className="size-3.5" />
              Back to catalogue
            </Link>
            <div className="flex min-w-0 items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
                <Inbox className="size-5" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
                  Command
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Review desk
                </h2>
                <p className="mt-1.5 text-sm text-slate-500">
                  One listing at a time. Approve it, or send it back with a reason the vendor can fix.
                </p>
              </div>
            </div>
          </header>
        </DashboardReveal>

        <DashboardReveal index={1}>
          {isLoading ? (
            <ProductRosterSkeleton rows={4} />
          ) : isError ? (
            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
              <EmptyState
                icon={Package}
                title="Could not load the review queue"
                description={parseApiError(error, 'Pending listings are unavailable right now.').message}
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
          ) : (
            <ProductPendingStage
              key={page}
              products={products}
              page={pagination.page}
              totalPages={pagination.lastPage}
              total={pagination.total}
              onPageChange={setPage}
              onOpenProduct={(id) => navigate(`/products/${id}`)}
            />
          )}
        </DashboardReveal>
      </div>
    </DashboardLayout>
  )
}
