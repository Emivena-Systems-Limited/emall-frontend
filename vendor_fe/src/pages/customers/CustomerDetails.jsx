import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, Star } from 'lucide-react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import EmptyState from '../../components/dashboard/EmptyState'
import CustomerDetailLoader from '../../components/customers/CustomerDetailLoader'
import CustomerRowActions from '../../components/customers/CustomerRowActions'
import CustomerDetailHeader, {
  CustomerDetailTabs,
  CustomerOverviewPanel,
} from '../../components/customers/CustomerDetailSections'
import { EMPTY_STATE_PRESETS } from '../../constants/emptyStates'
import { useCustomer } from '../../hooks/useCustomers'
import notify from '../../lib/notify'
import { formatDateTime } from '../../utils/financeUtils'
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

function CustomerReviewsPanel({ reviews }) {
  const preset = EMPTY_STATE_PRESETS.customerReviews

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-bold text-slate-900">Customer reviews</h2>
        <p className="mt-0.5 text-sm text-slate-500">Feedback left on your products</p>
      </div>
      {reviews.length === 0 ? (
        <EmptyState
          icon={preset.icon}
          title={preset.title}
          description={preset.description}
        />
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
                <span className="text-xs text-slate-500">{formatDateTime(review.date)}</span>
              </div>
              {review.comment ? (
                <p className="mt-3 text-sm leading-relaxed text-slate-700">&ldquo;{review.comment}&rdquo;</p>
              ) : null}
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
        <CustomerDetailLoader />
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

  const reviewsCount = customer.reviewsCount ?? customer.reviews?.length ?? 0
  const tabCounts = {
    reviews: reviewsCount,
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

          <div className="pt-5">
            {activeTab === 'overview' && <CustomerOverviewPanel customer={customer} />}
            {activeTab === 'reviews' && <CustomerReviewsPanel reviews={customer.reviews ?? []} />}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
