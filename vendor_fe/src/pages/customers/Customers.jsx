import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { useSearchParams } from 'react-router'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import CustomerCatalogLoader from '../../components/customers/CustomerCatalogLoader'
import CustomerCatalogToolbar from '../../components/customers/CustomerCatalogToolbar'
import CustomerFiltersDrawer, { countCustomerDrawerFilters } from '../../components/customers/CustomerFiltersDrawer'
import { CustomerCatalogEmptyState } from '../../components/customers/CustomerEmptyState'
import CustomerSummaryCards from '../../components/customers/CustomerSummaryCards'
import CustomerTable from '../../components/customers/CustomerTable'
import OrderPagination from '../../components/orders/OrderPagination'
import {
  CUSTOMERS_PAGE_SIZE,
  CUSTOMER_SEGMENTS,
  DEFAULT_ORDER_DATE_RANGE,
  resolveCustomerSegment,
} from '../../constants/customers'
import { getCustomerSummaryFromCatalog } from '../../mocks/customerMockData'
import { useCustomers } from '../../hooks/useCustomers'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import notify from '../../lib/notify'
import {
  filterCustomerCatalog,
  paginateCustomers,
} from '../../utils/customerCatalogFilters'
import { printCustomerProfile } from '../../utils/printCustomer'

export default function Customers() {
  const [searchParams] = useSearchParams()
  const segment = resolveCustomerSegment(searchParams)

  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebouncedValue(searchInput, 300)
  const [orderDateRange, setOrderDateRange] = useState(DEFAULT_ORDER_DATE_RANGE)
  const [minSpend, setMinSpend] = useState('')
  const [maxSpend, setMaxSpend] = useState('')
  const debouncedMinSpend = useDebouncedValue(minSpend, 300)
  const debouncedMaxSpend = useDebouncedValue(maxSpend, 300)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [page, setPage] = useState(1)

  const catalogQuery = useCustomers()
  const listFilters = useMemo(
    () => ({
      search: debouncedSearch,
      segment,
      startDate: orderDateRange.startDate,
      endDate: orderDateRange.endDate,
      minSpend: debouncedMinSpend,
      maxSpend: debouncedMaxSpend,
    }),
    [
      debouncedSearch,
      segment,
      orderDateRange.startDate,
      orderDateRange.endDate,
      debouncedMinSpend,
      debouncedMaxSpend,
    ],
  )
  const listQuery = useCustomers(listFilters)

  const catalogCustomers = catalogQuery.data ?? []
  const listedCustomers = listQuery.data ?? []
  const {
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = listQuery

  const summary = useMemo(
    () => getCustomerSummaryFromCatalog(catalogCustomers),
    [catalogCustomers],
  )

  const filteredCustomers = useMemo(
    () =>
      filterCustomerCatalog(listedCustomers, {
        search: debouncedSearch,
        segment,
        orderDateRange,
        minSpend: debouncedMinSpend,
        maxSpend: debouncedMaxSpend,
      }),
    [
      listedCustomers,
      debouncedSearch,
      segment,
      orderDateRange,
      debouncedMinSpend,
      debouncedMaxSpend,
    ],
  )

  const pagination = useMemo(
    () => paginateCustomers(filteredCustomers, { page, pageSize: CUSTOMERS_PAGE_SIZE }),
    [filteredCustomers, page],
  )

  const drawerFilterCount = countCustomerDrawerFilters({ orderDateRange, minSpend, maxSpend })
  const hasCustomers = catalogCustomers.length > 0 || listedCustomers.length > 0
  const isNewThisMonthView = segment === CUSTOMER_SEGMENTS.NEW_THIS_MONTH
  const isReviewsReceivedView = segment === CUSTOMER_SEGMENTS.WITH_REVIEWS
  const hasSearchQuery = debouncedSearch.trim().length > 0
  const isSearchPending = searchInput.trim() !== debouncedSearch.trim()
    || minSpend !== debouncedMinSpend
    || maxSpend !== debouncedMaxSpend
  const emptyVariant = hasSearchQuery ? 'search' : 'filter'
  const showPageLoader = isLoading && catalogCustomers.length === 0 && listedCustomers.length === 0

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, segment, orderDateRange, debouncedMinSpend, debouncedMaxSpend])

  useEffect(() => {
    if (isError) {
      notify.fromError(error, 'Unable to load customers')
    }
  }, [error, isError])

  const handlePrint = (customer) => {
    const didPrint = printCustomerProfile(customer)
    if (!didPrint) {
      notify.error('Unable to open the print window. Check your browser popup settings.')
    }
  }

  const handleClearDrawerFilters = () => {
    setOrderDateRange(DEFAULT_ORDER_DATE_RANGE)
    setMinSpend('')
    setMaxSpend('')
  }

  return (
    <DashboardLayout pageTitle="Customers">
      <div className="page-enter space-y-5">
        {showPageLoader ? (
          <CustomerCatalogLoader />
        ) : isError && listedCustomers.length === 0 && catalogCustomers.length === 0 ? (
          <div className="mx-auto max-w-md space-y-5 rounded-2xl border border-slate-200 bg-white py-16 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-100">
              <AlertTriangle className="size-6" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-950">Unable to load customers</h2>
              <p className="mt-2 text-sm text-slate-500">
                {error?.message ?? 'Something went wrong while loading your customers. Please try again.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-bold text-slate-950">Customers</h1>
              <p className="mt-1 text-sm text-slate-500">
                View customers who have purchased from your store.
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-700">
                {summary.total} customer{summary.total === 1 ? '' : 's'}
              </p>
              {isNewThisMonthView && (
                <p className="mt-1 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                  Showing new customers this month
                </p>
              )}
              {isReviewsReceivedView && (
                <p className="mt-1 inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-100">
                  Showing customers who left reviews
                </p>
              )}
            </div>

            <CustomerSummaryCards summary={summary} />

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
              <div className="border-b border-slate-100 px-5 py-4">
                <CustomerCatalogToolbar
                  search={searchInput}
                  onSearchChange={setSearchInput}
                  isSearchPending={isSearchPending}
                  onOpenFilters={() => setFiltersOpen(true)}
                  activeFilterCount={drawerFilterCount}
                  orderDateRange={orderDateRange}
                  onOrderDateRangeChange={setOrderDateRange}
                  minSpend={minSpend}
                  onMinSpendChange={setMinSpend}
                  maxSpend={maxSpend}
                  onMaxSpendChange={setMaxSpend}
                  onClearFilters={handleClearDrawerFilters}
                />
              </div>

              {!hasCustomers ? (
                <CustomerCatalogEmptyState />
              ) : (
                <>
                  <CustomerTable
                    customers={pagination.items}
                    onPrint={handlePrint}
                    emptyVariant={emptyVariant}
                    orderFilters={{ orderDateRange, minSpend, maxSpend }}
                  />
                  {pagination.totalItems > 0 && (
                    <OrderPagination
                      page={pagination.page}
                      pageCount={pagination.pageCount}
                      totalItems={pagination.totalItems}
                      startIndex={pagination.startIndex}
                      endIndex={pagination.endIndex}
                      onPageChange={setPage}
                      itemLabel="customers"
                    />
                  )}
                </>
              )}
            </section>

            <CustomerFiltersDrawer
              open={filtersOpen}
              onClose={() => setFiltersOpen(false)}
              orderDateRange={orderDateRange}
              onOrderDateRangeChange={setOrderDateRange}
              minSpend={minSpend}
              onMinSpendChange={setMinSpend}
              maxSpend={maxSpend}
              onMaxSpendChange={setMaxSpend}
              onClearFilters={handleClearDrawerFilters}
              resultCount={filteredCustomers.length}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
