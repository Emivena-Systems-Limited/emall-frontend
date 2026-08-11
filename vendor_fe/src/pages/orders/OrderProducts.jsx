import { Link, useLocation, useParams } from 'react-router'
import { AlertTriangle, ArrowLeft, ChevronRight, Package, RefreshCw } from 'lucide-react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import OrderProductsLoader from '../../components/orders/OrderProductsLoader'
import { useVendorOrder } from '../../hooks/useVendorOrders'
import { buildViewProductPath, getUniqueOrderProducts } from '../../utils/orderProductNavigation'
import { getOrdersReturnLabel, resolveOrdersReturnTo } from '../../utils/orderNavigation'

export default function OrderProducts() {
  const { orderId } = useParams()
  const location = useLocation()
  const ordersReturnTo = resolveOrdersReturnTo(location)
  const ordersReturnLabel = getOrdersReturnLabel(ordersReturnTo)
  const { data: order, isLoading, isError, error, refetch, isFetching } = useVendorOrder(orderId)
  const products = order ? getUniqueOrderProducts(order) : []

  if (isLoading) {
    return (
      <DashboardLayout pageTitle="Order products">
        <OrderProductsLoader />
      </DashboardLayout>
    )
  }

  if (isError) {
    return (
      <DashboardLayout pageTitle="Order products">
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
      <DashboardLayout pageTitle="Order products">
        <div className="page-enter rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-sm text-slate-600">Order not found.</p>
          <Link to={ordersReturnTo} className="mt-4 inline-flex text-sm font-bold text-cyan-700 hover:text-cyan-900">
            {ordersReturnLabel}
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout pageTitle="Order products">
      <div className="page-enter space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to={`/orders/${order.id}`}
            state={location.state}
            className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-brand"
          >
            <ArrowLeft className="size-4" />
            Back to order
          </Link>
          <Link
            to={ordersReturnTo}
            className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-brand"
          >
            <ArrowLeft className="size-4" />
            {ordersReturnLabel}
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-950">Select a product</h1>
          <p className="mt-1 text-sm text-slate-500">
            Order {order.orderNumber} includes {products.length} products. Choose one to view.
          </p>
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
          <ul className="divide-y divide-slate-100">
            {products.map((item) => (
              <li key={item.productId}>
                <Link
                  to={buildViewProductPath(item.productId, order.id)}
                  state={location.state}
                  className="flex cursor-pointer items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50/80"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="size-14 shrink-0 rounded-xl object-cover ring-1 ring-slate-200"
                    />
                  ) : (
                    <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400 ring-1 ring-slate-200">
                      <Package className="size-6" strokeWidth={1.5} />
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{item.productName}</p>
                    {item.variantLabel || item.variantName ? (
                      <p className="mt-1 text-xs text-slate-500">{item.variantLabel ?? item.variantName}</p>
                    ) : null}
                    <p className="mt-1 text-xs text-slate-500">SKU: {item.sku}</p>
                    <p className="mt-1 text-xs text-slate-500">Qty ordered: {item.quantity}</p>
                  </div>

                  <ChevronRight className="size-4 shrink-0 text-slate-400" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </DashboardLayout>
  )
}
