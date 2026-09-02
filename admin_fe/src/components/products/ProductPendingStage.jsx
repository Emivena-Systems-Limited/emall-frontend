import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Package,
  Shield,
  Store,
  XCircle,
} from 'lucide-react'
import { formatCedi } from '../../utils/formatters'
import { validateProductRejectionReason } from '../../constants/adminProducts'
import { useUpdateProductStatusMutation } from '../../hooks/useAdminProducts'
import VendorStatusReasonField from '../vendors/VendorStatusReasonField'
import EmptyState from '../dashboard/EmptyState'

export default function ProductPendingStage({
  products,
  page,
  totalPages,
  total,
  onPageChange,
  onOpenProduct,
}) {
  const [index, setIndex] = useState(0)
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState('')
  const mutation = useUpdateProductStatusMutation()
  const safeIndex = products.length === 0 ? 0 : Math.min(index, products.length - 1)
  const current = products[safeIndex] ?? null
  const remaining = useMemo(() => Math.max(0, total - 1), [total])

  const selectIndex = (nextIndex) => {
    setIndex(nextIndex)
    setRejecting(false)
    setReason('')
    setReasonError('')
  }

  const goNext = () => {
    if (safeIndex < products.length - 1) {
      selectIndex(safeIndex + 1)
      return
    }
    if (page < totalPages) onPageChange(page + 1)
  }

  const goPrev = () => {
    if (safeIndex > 0) {
      selectIndex(safeIndex - 1)
      return
    }
    if (page > 1) onPageChange(page - 1)
  }

  const handleApprove = async () => {
    if (!current) return
    try {
      await mutation.mutateAsync({ id: current.id, status: 'approved' })
      setRejecting(false)
    } catch {
      /* toast handled */
    }
  }

  const handleReject = async () => {
    if (!current) return
    const error = validateProductRejectionReason(reason)
    if (error) {
      setReasonError(error)
      return
    }
    try {
      await mutation.mutateAsync({
        id: current.id,
        status: 'rejected',
        rejectionReason: reason,
      })
      setRejecting(false)
      setReason('')
    } catch {
      /* toast handled */
    }
  }

  if (!current) {
    return (
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
        <EmptyState
          icon={CheckCircle2}
          title="Review queue is clear"
          description="Every pending listing has been decided. New vendor submissions will land here."
        />
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
      <div className="relative overflow-hidden border-b border-amber-100 bg-gradient-to-r from-amber-50 via-white to-white px-5 py-4 sm:px-6">
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-brand" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">Review desk</p>
            <h2 className="mt-1 text-lg font-bold text-slate-950">Decide this listing</h2>
            <p className="text-xs text-slate-500">
              {remaining} still waiting after this one · page {page} of {totalPages}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goPrev}
              disabled={page <= 1 && safeIndex <= 0}
              aria-label="Previous listing"
              className="inline-flex size-9 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={page >= totalPages && safeIndex >= products.length - 1}
              aria-label="Next listing"
              className="inline-flex size-9 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="min-w-0 bg-slate-50 p-4 sm:p-6">
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            {current.image ? (
              <img src={current.image} alt="" className="aspect-[4/3] w-full object-contain bg-[#f4f4f5]" />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center bg-slate-100 text-slate-400">
                <Package className="size-10" />
              </div>
            )}
          </div>
          {products.length > 1 && (
            <ul className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {products.map((item, itemIndex) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => selectIndex(itemIndex)}
                    aria-label={item.name}
                    aria-current={itemIndex === safeIndex ? 'true' : undefined}
                    className={`size-16 overflow-hidden rounded-xl ring-2 transition-all ${
                      itemIndex === safeIndex ? 'ring-brand' : 'ring-transparent hover:ring-slate-300'
                    }`}
                  >
                    {item.image ? (
                      <img src={item.image} alt="" className="size-full object-cover" />
                    ) : (
                      <span className="flex size-full items-center justify-center bg-white text-slate-400">
                        <Package className="size-4" />
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="flex min-w-0 flex-col gap-5 p-5 sm:p-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700">Awaiting approval</p>
            <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{current.name}</h3>
            <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900">{formatCedi(current.price)}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold ring-1 ring-slate-200">
                <Store className="size-3.5" aria-hidden="true" />
                {current.vendorName || 'Unknown store'}
              </span>
              {current.category ? (
                <span className="text-xs text-slate-500">{current.category}</span>
              ) : null}
            </div>
          </div>

          <div className="grid gap-2">
            <button
              type="button"
              disabled={mutation.isPending}
              onClick={handleApprove}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
              Approve listing
            </button>
            <button
              type="button"
              disabled={mutation.isPending}
              onClick={() => setRejecting((value) => !value)}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              <XCircle className="size-4" />
              Reject with a reason
            </button>
          </div>

          {rejecting ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <VendorStatusReasonField
                id="pending-rejection-reason"
                value={reason}
                onChange={(value) => {
                  setReason(value)
                  if (reasonError) setReasonError('')
                }}
                error={reasonError}
                disabled={mutation.isPending}
                label="Why this listing is being sent back"
                hint="The vendor sees this note. Be specific enough to fix."
              />
              <button
                type="button"
                disabled={mutation.isPending}
                onClick={handleReject}
                className="mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Shield className="size-4" />}
                Send back to vendor
              </button>
            </div>
          ) : null}

          <div className="mt-auto grid gap-2">
            <button
              type="button"
              onClick={() => onOpenProduct(current.id)}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Eye className="size-4" />
              Open shopper preview
            </button>
            {current.vendorId ? (
              <Link
                to={`/vendors/${current.vendorId}`}
                className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-brand"
              >
                View vendor
                <ArrowRight className="size-4" />
              </Link>
            ) : null}
          </div>
        </aside>
      </div>
    </section>
  )
}
