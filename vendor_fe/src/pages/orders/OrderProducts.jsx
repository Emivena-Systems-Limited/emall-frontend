import { Link, useParams } from 'react-router'
import { ArrowLeft, ChevronRight, Package } from 'lucide-react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import { getOrderById } from '../../constants/ordersData'
import { buildViewProductPath, getUniqueOrderProducts } from '../../utils/orderProductNavigation'

export default function OrderProducts() {
  const { orderId } = useParams()
  const order = getOrderById(orderId)
  const products = order ? getUniqueOrderProducts(order) : []

  if (!order) {
    return (
      <DashboardLayout pageTitle="Order products">
        <div className="page-enter rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-sm text-slate-600">Order not found.</p>
          <Link to="/orders" className="mt-4 inline-flex text-sm font-bold text-cyan-700 hover:text-cyan-900">
            Back to orders
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout pageTitle="Order products">
      <div className="page-enter space-y-5">
        <Link
          to={`/orders/${order.id}`}
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-brand"
        >
          <ArrowLeft className="size-4" />
          Back to order
        </Link>

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
