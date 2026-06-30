import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import EmptyState from '../../components/dashboard/EmptyState'
import CustomerCatalogToolbar from '../../components/customers/CustomerCatalogToolbar'
import CustomerSummaryCards from '../../components/customers/CustomerSummaryCards'
import CustomerTable from '../../components/customers/CustomerTable'
import OrderPagination from '../../components/orders/OrderPagination'
import {
  CUSTOMERS_PAGE_SIZE,
  CUSTOMER_SEGMENTS,
  ORDER_DATE_FILTERS,
  SPEND_FILTERS,
} from '../../constants/customers'
import {
  getCustomerSummaryFromCatalog,
  MOCK_VENDOR_CUSTOMERS,
} from '../../constants/customersData'
import { EMPTY_STATE_PRESETS } from '../../constants/emptyStates'
import notify from '../../lib/notify'
import {
  filterCustomerCatalog,
  paginateCustomers,
} from '../../utils/customerCatalogFilters'
import { printCustomerProfile } from '../../utils/printCustomer'

export default function Customers() {
  const [searchParams] = useSearchParams()
  const segmentParam = searchParams.get('segment')
  const segment = segmentParam === CUSTOMER_SEGMENTS.NEW_THIS_MONTH
    ? CUSTOMER_SEGMENTS.NEW_THIS_MONTH
    : CUSTOMER_SEGMENTS.ALL

  const [customers] = useState(MOCK_VENDOR_CUSTOMERS)
  const [search, setSearch] = useState('')
  const [orderDateFilter, setOrderDateFilter] = useState(ORDER_DATE_FILTERS.ALL)
  const [spendFilter, setSpendFilter] = useState(SPEND_FILTERS.ALL)
  const [page, setPage] = useState(1)

  const summary = useMemo(() => getCustomerSummaryFromCatalog(customers), [customers])

  const filteredCustomers = useMemo(
    () =>
      filterCustomerCatalog(customers, {
        search,
        segment,
        orderDateFilter,
        spendFilter,
      }),
    [customers, search, segment, orderDateFilter, spendFilter],
  )

  const pagination = useMemo(
    () => paginateCustomers(filteredCustomers, { page, pageSize: CUSTOMERS_PAGE_SIZE }),
    [filteredCustomers, page],
  )

  const preset = EMPTY_STATE_PRESETS.customers
  const hasCustomers = customers.length > 0
  const isNewThisMonthView = segment === CUSTOMER_SEGMENTS.NEW_THIS_MONTH

  useEffect(() => {
    setPage(1)
  }, [search, segment, orderDateFilter, spendFilter])

  const handlePrint = (customer) => {
    const didPrint = printCustomerProfile(customer)
    if (!didPrint) {
      notify.error('Unable to open the print window. Check your browser popup settings.')
    }
  }

  return (
    <DashboardLayout pageTitle="Customers">
      <div className="page-enter space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Customers</h1>
          <p className="mt-1 text-sm text-slate-500">
            View customers who have purchased from your store.
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-700">
            {summary.total} customer{summary.total === 1 ? '' : 's'} total
          </p>
          {isNewThisMonthView && (
            <p className="mt-1 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
              Showing new customers this month
            </p>
          )}
        </div>

        <CustomerSummaryCards summary={summary} />

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
          <div className="border-b border-slate-100 px-5 py-4">
            <CustomerCatalogToolbar
              search={search}
              onSearchChange={setSearch}
              orderDateFilter={orderDateFilter}
              onOrderDateFilterChange={setOrderDateFilter}
              spendFilter={spendFilter}
              onSpendFilterChange={setSpendFilter}
            />
          </div>

          {!hasCustomers ? (
            <EmptyState
              icon={preset.icon}
              title={preset.title}
              description={preset.description}
            />
          ) : (
            <>
              <CustomerTable customers={pagination.items} onPrint={handlePrint} />
              <OrderPagination
                page={pagination.page}
                pageCount={pagination.pageCount}
                totalItems={pagination.totalItems}
                startIndex={pagination.startIndex}
                endIndex={pagination.endIndex}
                onPageChange={setPage}
                itemLabel="customers"
              />
            </>
          )}
        </section>
      </div>
    </DashboardLayout>
  )
}
