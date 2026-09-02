import { useState } from 'react'
import { useParams } from 'react-router'
import { Ban, Package, Pencil, RotateCcw } from 'lucide-react'
import VendorWorkspace from '../components/vendors/VendorWorkspace'
import VendorStatusModal from '../components/vendors/VendorStatusModal'
import VendorSuspendModal from '../components/vendors/VendorSuspendModal'
import EmptyState from '../components/dashboard/EmptyState'
import { getVendorProducts } from '../constants/vendorsData'
import { formatCedi, formatCount } from '../utils/formatters'

export default function VendorProducts() {
  const { vendorId } = useParams()
  const [statusOpen, setStatusOpen] = useState(false)
  const [suspendOpen, setSuspendOpen] = useState(false)

  return (
    <VendorWorkspace vendorId={vendorId} current="products" pageTitle="Products">
      {(vendor) => {
        const products = getVendorProducts(vendor)
        const isSuspended = vendor.status === 'suspended'

        const toolbar = (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setStatusOpen(true)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-brand/40 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              <Pencil className="size-3.5" />
              Update vendor account
            </button>
            <span aria-hidden="true" className="hidden h-6 w-px bg-slate-200 sm:block" />
            <button
              type="button"
              onClick={() => setSuspendOpen(true)}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
                isSuspended
                  ? 'border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50'
                  : 'border border-rose-200 bg-white text-rose-700 hover:bg-rose-50'
              }`}
            >
              {isSuspended ? <RotateCcw className="size-3.5" /> : <Ban className="size-3.5" />}
              {isSuspended ? 'Reinstate vendor' : 'Suspend'}
            </button>
          </div>
        )

        return (
          <>
            {products.length === 0 ? (
              <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
                <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Catalogue</h3>
                    <p className="text-xs text-slate-500">No listings on this store yet</p>
                  </div>
                  {toolbar}
                </div>
                <EmptyState
                  icon={Package}
                  title="No products on this store yet"
                  description="Pending review accounts usually have an empty catalogue until they are approved."
                />
              </section>
            ) : (
              <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
                <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Catalogue</h3>
                    <p className="text-xs text-slate-500">
                      {formatCount(products.length)} of {formatCount(vendor.listings)} listings shown for this demo
                    </p>
                  </div>
                  {toolbar}
                </div>
                <ul className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => (
                    <li
                      key={product.id}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-[0_16px_40px_rgba(15,23,42,0.06)]"
                    >
                      <img src={product.image} alt="" className="h-40 w-full object-cover" />
                      <div className="space-y-2 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-bold text-slate-900">{product.name}</p>
                          <span className="shrink-0 rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-slate-600 ring-1 ring-slate-200 uppercase">
                            {product.status}
                          </span>
                        </div>
                        <p className="text-lg font-bold tabular-nums text-slate-950">{formatCedi(product.price)}</p>
                        <p className="text-xs text-slate-500">
                          {formatCount(product.stock)} in stock · {formatCount(product.sold30d)} sold in 30 days
                        </p>
                      </div>
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
          </>
        )
      }}
    </VendorWorkspace>
  )
}
