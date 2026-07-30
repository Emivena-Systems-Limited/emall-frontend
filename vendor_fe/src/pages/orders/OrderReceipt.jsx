import { useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { useSelector } from 'react-redux'
import {
  AlertTriangle,
  ArrowLeft,
  Download,
  Loader2,
  Printer,
  RefreshCw,
} from 'lucide-react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import OrderReceiptSheet from '../../components/orders/OrderReceiptSheet'
import { useVendorOrder } from '../../hooks/useVendorOrders'
import notify from '../../lib/notify'
import { buildReceiptFilename, downloadReceiptPdf } from '../../utils/downloadReceiptPdf'

export default function OrderReceipt() {
  const { orderId } = useParams()
  const location = useLocation()
  const listPayment = location.state?.listPayment ?? null
  const receiptRef = useRef(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const authUser = useSelector((state) => state.auth.user)
  const storeName = authUser?.store_name ?? authUser?.trading_name ?? authUser?.business_name ?? 'Your Store'

  const { data: order, isLoading, isError, error, refetch, isFetching } = useVendorOrder(orderId, { listPayment })

  const handleDownloadPdf = async () => {
    if (!receiptRef.current || !order) return

    setIsDownloading(true)
    try {
      await downloadReceiptPdf(receiptRef.current, buildReceiptFilename(order.orderNumber))
      notify.success('Receipt downloaded as PDF.')
    } catch (downloadError) {
      notify.fromError(downloadError, 'Unable to download receipt PDF')
    } finally {
      setIsDownloading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <DashboardLayout pageTitle="Order receipt">
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-24 text-sm font-semibold text-slate-500">
          <Loader2 className="size-4 animate-spin text-brand" />
          Loading receipt…
        </div>
      </DashboardLayout>
    )
  }

  if (isError) {
    return (
      <DashboardLayout pageTitle="Order receipt">
        <div className="page-enter mx-auto max-w-md space-y-5 rounded-2xl border border-slate-200 bg-white py-16 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-100">
            <AlertTriangle className="size-6" />
          </span>
          <p className="text-sm text-slate-500">
            {error?.message ?? 'Something went wrong while fetching this order.'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
            Retry
          </button>
        </div>
      </DashboardLayout>
    )
  }

  if (!order) {
    return (
      <DashboardLayout pageTitle="Order receipt">
        <div className="page-enter rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-sm text-slate-600">Order not found.</p>
          <Link to="/orders" className="mt-4 inline-flex text-sm font-bold text-brand hover:text-brand-hover">
            Back to orders
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout pageTitle="Order receipt">
      <div className="page-enter space-y-6">
        <div className="receipt-toolbar flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              to={`/orders/${order.id}`}
              className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-brand"
            >
              <ArrowLeft className="size-4" />
              Back to order
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-slate-950">Receipt — {order.orderNumber}</h1>
            <p className="mt-1 text-sm text-slate-500">Preview your receipt, then download or print.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Printer className="size-4" />
              Print
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDownloading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              Download PDF
            </button>
          </div>
        </div>

        <div className="receipt-preview-shell flex justify-center pb-8">
          <OrderReceiptSheet ref={receiptRef} order={order} storeName={storeName} />
        </div>
      </div>
    </DashboardLayout>
  )
}
