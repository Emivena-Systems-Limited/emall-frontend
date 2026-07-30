import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import EmptyState from '../../components/dashboard/EmptyState'
import OrderCatalogToolbar from '../../components/orders/OrderCatalogToolbar'
import OrderPagination from '../../components/orders/OrderPagination'
import OrderSummaryCards from '../../components/orders/OrderSummaryCards'
import OrderTable from '../../components/orders/OrderTable'
import UpdateOrderStatusModal from '../../components/orders/UpdateOrderStatusModal'
import { ORDERS_PAGE_SIZE, STATUS_FILTERS, SUMMARY_FILTERS } from '../../constants/orders'
import { EMPTY_STATE_PRESETS } from '../../constants/emptyStates'
import { useVendorOrders } from '../../hooks/useVendorOrders'
import notify from '../../lib/notify'
import {
  filterOrderCatalog,
  getActiveSummaryFilter,
  getOrderCatalogSummary,
  paginateOrders,
} from '../../utils/orderCatalogFilters'
import { normalizeVendorOrdersList } from '../../utils/normalizeVendorOrders'

export default function Orders() {
  const { data, isLoading, isError, error, refetch, isFetching } = useVendorOrders()
  const [statusPatches, setStatusPatches] = useState({})
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(STATUS_FILTERS.ALL)
  const [page, setPage] = useState(1)
  const [statusUpdateRequest, setStatusUpdateRequest] = useState(null)

  const orders = useMemo(() => {
    const normalized = normalizeVendorOrdersList(data)
    return normalized.map((order) => (
      statusPatches[order.id]
        ? { ...order, orderStatus: statusPatches[order.id] }
        : order
    ))
  }, [data, statusPatches])

  const summary = useMemo(() => getOrderCatalogSummary(orders), [orders])

  const filteredOrders = useMemo(
    () => filterOrderCatalog(orders, { search, statusFilter }),
    [orders, search, statusFilter],
  )

  const pagination = useMemo(
    () => paginateOrders(filteredOrders, { page, pageSize: ORDERS_PAGE_SIZE }),
    [filteredOrders, page],
  )

  const activeSummaryFilter = getActiveSummaryFilter(statusFilter) ?? SUMMARY_FILTERS.ALL
  const preset = EMPTY_STATE_PRESETS.orders
  const hasOrders = orders.length > 0

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter])

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

  const handleStatusChange = (order, nextStatus) => {
    if (order.orderStatus === nextStatus) {
      setStatusUpdateRequest(null)
      return
    }

    setStatusPatches((current) => ({
      ...current,
      [order.id]: nextStatus,
    }))
    setStatusUpdateRequest(null)
    notify.success(`Order ${order.orderNumber} updated to ${nextStatus.replaceAll('_', ' ')}.`)
  }

  return (
    <DashboardLayout pageTitle="Orders">
      <div className="page-enter space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Orders</h1>
          <p className="mt-1 text-sm text-slate-500">
            View and manage customer orders from your store.
          </p>
        </div>

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
        ) : (
          <>
            <OrderSummaryCards
              summary={summary}
              activeFilter={activeSummaryFilter}
              onFilterChange={handleSummaryFilterChange}
            />

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
                  title={preset.title}
                  description={preset.description}
                />
              ) : (
                <>
                  <OrderTable
                    orders={pagination.items}
                    onUpdateStatus={setStatusUpdateRequest}
                  />
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

      <UpdateOrderStatusModal
        open={Boolean(statusUpdateRequest)}
        order={statusUpdateRequest}
        onClose={() => setStatusUpdateRequest(null)}
        onConfirm={handleStatusChange}
      />
    </DashboardLayout>
  )
}
