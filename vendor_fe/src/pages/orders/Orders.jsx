import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ArrowLeft, Loader2, RefreshCw } from 'lucide-react'
import { Link, useSearchParams } from 'react-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import EmptyState from '../../components/dashboard/EmptyState'
import OrderCatalogToolbar from '../../components/orders/OrderCatalogToolbar'
import OrderPagination from '../../components/orders/OrderPagination'
import OrderSummaryCards from '../../components/orders/OrderSummaryCards'
import OrderTable from '../../components/orders/OrderTable'
import { ORDERS_PAGE_SIZE, STATUS_FILTERS, SUMMARY_FILTERS } from '../../constants/orders'
import { EMPTY_STATE_PRESETS } from '../../constants/emptyStates'
import { getCustomerById } from '../../mocks/customerMockData'
import { useVendorOrders } from '../../hooks/useVendorOrders'
import notify from '../../lib/notify'
import {
  filterOrderCatalog,
  getActiveSummaryFilter,
  getOrderCatalogSummary,
  paginateOrders,
} from '../../utils/orderCatalogFilters'
import { normalizeVendorOrdersList } from '../../utils/normalizeVendorOrders'
import { getCustomerInitials } from '../../utils/customerUtils'

export default function Orders() {
  const [searchParams] = useSearchParams()
  const customerId = searchParams.get('customerId')
  const customerContext = useMemo(
    () => (customerId ? getCustomerById(customerId) : null),
    [customerId],
  )
  const isCustomerOrdersView = Boolean(customerId)

  const { data, isLoading, isError, error, refetch, isFetching } = useVendorOrders()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(STATUS_FILTERS.ALL)
  const [page, setPage] = useState(1)

  const orders = useMemo(() => normalizeVendorOrdersList(data), [data])

  const scopedOrders = useMemo(
    () => filterOrderCatalog(orders, { customerEmail: customerContext?.email ?? null }),
    [orders, customerContext?.email],
  )

  const summary = useMemo(() => getOrderCatalogSummary(scopedOrders), [scopedOrders])

  const filteredOrders = useMemo(
    () => filterOrderCatalog(scopedOrders, { search, statusFilter }),
    [scopedOrders, search, statusFilter],
  )

  const pagination = useMemo(
    () => paginateOrders(filteredOrders, { page, pageSize: ORDERS_PAGE_SIZE }),
    [filteredOrders, page],
  )

  const activeSummaryFilter = getActiveSummaryFilter(statusFilter) ?? SUMMARY_FILTERS.ALL
  const preset = EMPTY_STATE_PRESETS.orders
  const hasOrders = scopedOrders.length > 0

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter, customerId])

  useEffect(() => {
    if (isError) {
      notify.fromError(error, 'Unable to load orders')
    }
  }, [error, isError])

  const handleSummaryFilterChange = (filterKey) => {
    setStatusFilter(filterKey === SUMMARY_FILTERS.ALL ? STATUS_FILTERS.ALL : filterKey)
  }

  const handleStatusFilterChange = (nextFilter) => {
    setStatusFilter(nextFilter)
  }

  const pageTitle = isCustomerOrdersView
    ? customerContext
      ? `Orders — ${customerContext.name}`
      : 'Customer orders'
    : 'Orders'

  return (
    <DashboardLayout pageTitle={pageTitle}>
      <div className="page-enter space-y-5">
        {isCustomerOrdersView ? (
          customerContext ? (
            <div className="overflow-hidden rounded-2xl border border-brand/15 bg-linear-to-r from-brand-light/30 via-white to-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand text-sm font-bold text-white shadow-[0_8px_24px_rgba(199,59,45,0.25)]">
                    {getCustomerInitials(customerContext.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand/80">
                      Customer orders
                    </p>
                    <h1 className="mt-0.5 text-2xl font-bold text-slate-950">
                      Orders by {customerContext.name}
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                      Viewing {scopedOrders.length} order{scopedOrders.length === 1 ? '' : 's'} placed by this customer.
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">{customerContext.email}</p>
                  </div>
                </div>
                <Link
                  to={`/customers/${customerContext.id}`}
                  className="inline-flex shrink-0 cursor-pointer items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-brand/30 hover:bg-brand-light/20 hover:text-brand"
                >
                  <ArrowLeft className="size-4" />
                  Back to customer
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
              <p className="text-sm text-slate-600">Customer not found.</p>
              <Link to="/customers" className="mt-4 inline-flex text-sm font-bold text-brand hover:underline">
                Back to customers
              </Link>
            </div>
          )
        ) : (
          <div>
            <h1 className="text-2xl font-bold text-slate-950">Orders</h1>
            <p className="mt-1 text-sm text-slate-500">
              View and manage customer orders from your store.
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-24 text-sm font-semibold text-slate-500">
            <Loader2 className="size-4 animate-spin text-brand" />
            Loading orders…
          </div>
        ) : isError ? (
          <div className="mx-auto max-w-md space-y-5 rounded-2xl border border-slate-200 bg-white py-16 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-100">
              <AlertTriangle className="size-6" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-950">Unable to load orders</h2>
              <p className="mt-2 text-sm text-slate-500">
                {error?.message ?? 'Something went wrong while fetching your orders.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
              Retry
            </button>
          </div>
        ) : isCustomerOrdersView && !customerContext ? null : (
          <>
            {!isCustomerOrdersView && (
              <OrderSummaryCards
                summary={summary}
                activeFilter={activeSummaryFilter}
                onFilterChange={handleSummaryFilterChange}
              />
            )}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
              <div className="border-b border-slate-100 px-5 py-4">
                <OrderCatalogToolbar
                  search={search}
                  onSearchChange={setSearch}
                  statusFilter={statusFilter}
                  onStatusFilterChange={handleStatusFilterChange}
                />
              </div>

              {!hasOrders ? (
                <EmptyState
                  icon={preset.icon}
                  title={isCustomerOrdersView ? 'No orders from this customer' : preset.title}
                  description={
                    isCustomerOrdersView
                      ? 'This customer has not placed any orders yet.'
                      : preset.description
                  }
                />
              ) : (
                <>
                  <OrderTable orders={pagination.items} />
                  <OrderPagination
                    page={pagination.page}
                    pageCount={pagination.pageCount}
                    totalItems={pagination.totalItems}
                    startIndex={pagination.startIndex}
                    endIndex={pagination.endIndex}
                    onPageChange={setPage}
                  />
                </>
              )}
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
