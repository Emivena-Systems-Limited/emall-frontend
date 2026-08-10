import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, Loader2, Star } from 'lucide-react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import CustomerRowActions from '../../components/customers/CustomerRowActions'
import CustomerDetailHeader, {
  CustomerDetailTabs,
  CustomerOverviewPanel,
} from '../../components/customers/CustomerDetailSections'
import CustomerOrderProducts from '../../components/customers/CustomerOrderProducts'
import CustomerPurchasedItems from '../../components/customers/CustomerPurchasedItems'
import OrderStatusBadge from '../../components/orders/OrderStatusBadge'
import { useCustomer } from '../../hooks/useCustomers'
import notify from '../../lib/notify'
import { formatMoney, formatShortDate } from '../../utils/financeUtils'
import { printCustomerProfile } from '../../utils/printCustomer'

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={`size-3.5 ${index < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
        />
      ))}
    </div>
  )
}

function CustomerOrderHistory({ orders }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-bold text-slate-900">Order history</h2>
        <p className="mt-0.5 text-sm text-slate-500">{orders.length} order{orders.length === 1 ? '' : 's'} placed</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              <th className="px-5 py-3">Order ID</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Products Purchased</th>
              <th className="px-5 py-3">Total</th>
              <th className="px-5 py-3">Order Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <tr key={order.orderId} className="text-sm hover:bg-slate-50/60">
                <td className="whitespace-nowrap px-5 py-4">
                  <Link to={`/orders/${order.orderId}`} className="font-semibold text-brand hover:underline">
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-600">
                  {formatShortDate(order.orderDate)}
                </td>
                <td className="px-5 py-4 text-xs text-slate-600">
                  <CustomerOrderProducts
                    products={order.productsPurchased}
                    maxVisible={1}
                  />
                </td>
                <td className="whitespace-nowrap px-5 py-4 font-semibold tabular-nums text-slate-900">
                  {formatMoney(order.orderTotal)}
                </td>
                <td className="whitespace-nowrap px-5 py-4">
                  <OrderStatusBadge status={order.orderStatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function CustomerReviewsPanel({ reviews }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-bold text-slate-900">Customer reviews</h2>
        <p className="mt-0.5 text-sm text-slate-500">Feedback left on your products</p>
      </div>
      {reviews.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-sm font-semibold text-slate-800">No reviews yet</p>
          <p className="mt-1 text-sm text-slate-500">This customer hasn&apos;t submitted any reviews.</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {reviews.map((review) => (
            <li key={review.id} className="px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-slate-900">{review.productName}</p>
                  <div className="mt-2">
                    <StarRating rating={review.rating} />
                  </div>
                </div>
                <span className="text-xs text-slate-500">{formatShortDate(review.date)}</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">&ldquo;{review.comment}&rdquo;</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default function CustomerDetails() {
  const { customerId } = useParams()
  const { data: customer, isLoading, isError } = useCustomer(customerId)
  const [activeTab, setActiveTab] = useState('overview')

  if (isLoading) {
    return (
      <DashboardLayout pageTitle="Customer details">
        <div className="page-enter flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-24 text-sm font-semibold text-slate-500">
          <Loader2 className="size-4 animate-spin text-brand" />
          Loading customer details…
        </div>
      </DashboardLayout>
    )
  }

  if (isError || !customer) {
    return (
      <DashboardLayout pageTitle="Customer details">
        <div className="page-enter rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-sm text-slate-600">Customer not found.</p>
          <Link to="/customers" className="mt-4 inline-flex text-sm font-bold text-brand hover:underline">
            Back to customers
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const handlePrint = (targetCustomer) => {
    const didPrint = printCustomerProfile(targetCustomer)
    if (!didPrint) {
      notify.error('Unable to open the print window. Check your browser popup settings.')
    }
  }

  const tabCounts = {
    purchases: customer.purchasedItems?.length ?? 0,
    orders: customer.orderHistory.length,
    reviews: customer.reviews.length,
  }

  return (
    <DashboardLayout pageTitle="Customer details">
      <div className="page-enter space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-950">Customer Details</h1>
            <Link
              to="/customers"
              className="mt-2 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-brand"
            >
              <ArrowLeft className="size-4" />
              Back to Customers
            </Link>
          </div>
          <CustomerRowActions customer={customer} onPrint={handlePrint} hideViewDetails />
        </div>

        <CustomerDetailHeader customer={customer} />

        <div>
          <CustomerDetailTabs activeTab={activeTab} onTabChange={setActiveTab} counts={tabCounts} />

          <div className={activeTab === 'overview' ? 'rounded-b-2xl rounded-tr-2xl border border-t-0 border-slate-200 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]' : 'pt-5'}>
            {activeTab === 'overview' && <CustomerOverviewPanel customer={customer} />}
            {activeTab === 'purchases' && <CustomerPurchasedItems items={customer.purchasedItems} />}
            {activeTab === 'orders' && <CustomerOrderHistory orders={customer.orderHistory} />}
            {activeTab === 'reviews' && <CustomerReviewsPanel reviews={customer.reviews} />}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
