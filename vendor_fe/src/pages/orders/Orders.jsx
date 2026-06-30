import { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import EmptyState from '../../components/dashboard/EmptyState'
import OrderCatalogToolbar from '../../components/orders/OrderCatalogToolbar'
import OrderPagination from '../../components/orders/OrderPagination'
import OrderSummaryCards from '../../components/orders/OrderSummaryCards'
import OrderTable from '../../components/orders/OrderTable'
import UpdateOrderStatusModal from '../../components/orders/UpdateOrderStatusModal'
import { ORDERS_PAGE_SIZE, STATUS_FILTERS, SUMMARY_FILTERS } from '../../constants/orders'
import { MOCK_VENDOR_ORDERS } from '../../constants/ordersData'
import { EMPTY_STATE_PRESETS } from '../../constants/emptyStates'
import notify from '../../lib/notify'
import {
  filterOrderCatalog,
  getActiveSummaryFilter,
  getOrderCatalogSummary,
  paginateOrders,
} from '../../utils/orderCatalogFilters'
import { printOrderReceipt } from '../../utils/printOrder'

export default function Orders() {
  const [orders, setOrders] = useState(MOCK_VENDOR_ORDERS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(STATUS_FILTERS.ALL)
  const [page, setPage] = useState(1)
  const [statusUpdateRequest, setStatusUpdateRequest] = useState(null)

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

    setOrders((current) =>
      current.map((entry) =>
        entry.id === order.id ? { ...entry, orderStatus: nextStatus } : entry,
      ),
    )
    setStatusUpdateRequest(null)
    notify.success(`Order ${order.orderNumber} updated to ${nextStatus.replaceAll('_', ' ')}.`)
  }

  const handlePrint = (order) => {
    const didPrint = printOrderReceipt(order)
    if (!didPrint) {
      notify.error('Unable to open the print window. Check your browser popup settings.')
    }
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
                onPrint={handlePrint}
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
