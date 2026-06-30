import { Link, useParams } from 'react-router'
import { ArrowLeft, MapPin, ShoppingBag, Star, UserRound } from 'lucide-react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import CustomerActionsMenu from '../../components/customers/CustomerActionsMenu'
import OrderStatusBadge from '../../components/orders/OrderStatusBadge'
import { getCustomerById } from '../../constants/customersData'
import notify from '../../lib/notify'
import { printCustomerProfile } from '../../utils/printCustomer'

function formatDateTime(value) {
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatMoney(amount) {
  return `GH₵ ${Number(amount).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`
}

function SectionCard({ icon: Icon, title, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 ring-1 ring-slate-200">
          <Icon className="size-4" strokeWidth={2} />
        </span>
        <h2 className="whitespace-nowrap text-sm font-bold text-slate-900">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 py-3 last:border-b-0 sm:flex-row sm:items-start sm:justify-between">
      <dt className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="text-sm font-medium text-slate-800 sm:max-w-[65%] sm:text-right">{value || '—'}</dd>
    </div>
  )
}

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

export default function CustomerDetails() {
  const { customerId } = useParams()
  const customer = getCustomerById(customerId)

  if (!customer) {
    return (
      <DashboardLayout pageTitle="Customer details">
        <div className="page-enter rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-sm text-slate-600">Customer not found.</p>
          <Link to="/customers" className="mt-4 inline-flex text-sm font-bold text-cyan-700 hover:text-cyan-900">
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

  return (
    <DashboardLayout pageTitle="Customer details">
      <div className="page-enter space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/customers"
            className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-brand"
          >
            <ArrowLeft className="size-4" />
            Back to customers
          </Link>

          <CustomerActionsMenu
            customer={customer}
            onPrint={handlePrint}
            hideViewDetails
          />
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Customer</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-950">{customer.name}</h1>
              <p className="mt-2 text-sm text-slate-500">{customer.city}, {customer.region}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Total orders</p>
                <p className="mt-1 text-xl font-bold text-slate-950">{customer.totalOrders}</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Total spend</p>
                <p className="mt-1 text-xl font-bold text-slate-950">{formatMoney(customer.totalSpend)}</p>
              </div>
              <div className="col-span-2 rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100 sm:col-span-1">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">First purchase</p>
                <p className="mt-1 text-sm font-bold text-slate-950">{formatDateTime(customer.firstPurchaseDate)}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-2">
          <SectionCard icon={UserRound} title="Contact Details">
            <dl>
              <DetailRow label="Email" value={customer.email} />
              <DetailRow label="Phone" value={customer.phone} />
              <DetailRow label="Address" value={customer.address} />
            </dl>
          </SectionCard>

          <SectionCard icon={MapPin} title="Location">
            <dl>
              <DetailRow label="City" value={customer.city} />
              <DetailRow label="Region" value={customer.region} />
              <DetailRow label="Last Order Date" value={formatDateTime(customer.lastOrderDate)} />
            </dl>
          </SectionCard>
        </div>

        <SectionCard icon={Star} title="Customer Reviews">
          {customer.reviews.length === 0 ? (
            <p className="text-sm text-slate-500">This customer has not left any reviews yet.</p>
          ) : (
            <ul className="space-y-4">
              {customer.reviews.map((review) => (
                <li
                  key={review.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <StarRating rating={review.rating} />
                    <span className="text-xs text-slate-500">{formatDateTime(review.date)}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">{review.comment}</p>
                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    Order: {review.orderId}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard icon={ShoppingBag} title="Order History">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  <th className="whitespace-nowrap px-2 py-3">Order ID</th>
                  <th className="whitespace-nowrap px-2 py-3">Date</th>
                  <th className="whitespace-nowrap px-2 py-3">Products Purchased</th>
                  <th className="whitespace-nowrap px-2 py-3">Order Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customer.orderHistory.map((order) => (
                  <tr key={order.orderId} className="text-sm text-slate-700">
                    <td className="whitespace-nowrap px-2 py-3 font-semibold text-slate-900">
                      <Link
                        to={`/orders/${order.orderId}`}
                        className="text-cyan-700 hover:text-cyan-900"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-2 py-3 text-xs text-slate-600">
                      {formatDateTime(order.orderDate)}
                    </td>
                    <td className="px-2 py-3 text-xs text-slate-600">
                      {order.productsPurchased.join(', ')}
                    </td>
                    <td className="whitespace-nowrap px-2 py-3">
                      <OrderStatusBadge status={order.orderStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </DashboardLayout>
  )
}
