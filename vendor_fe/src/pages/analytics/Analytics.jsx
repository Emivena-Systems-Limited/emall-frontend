import { useEffect, useState } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import AnalyticsPageHeader from '../../components/analytics/AnalyticsPageHeader'
import AnalyticsExportDrawer from '../../components/analytics/AnalyticsExportDrawer'
import AnalyticsSummaryCards from '../../components/analytics/AnalyticsSummaryCards'
import AnalyticsSummaryCardsLoader from '../../components/analytics/AnalyticsSummaryCardsLoader'
import {
  CategoryBreakdownChart,
  CustomerGrowthChart,
  FulfillmentOverview,
  RevenueOrdersChart,
  SalesByRegionChart,
  TopProductsTable,
} from '../../components/analytics/AnalyticsCharts'
import { DEV_ANALYTICS, EMPTY_ANALYTICS, EMPTY_ANALYTICS_SUMMARY } from '../../constants/analyticsData'
import { useAnalyticsCustomerGrowth, useAnalyticsFulfillment, useAnalyticsRevenueOrders, useAnalyticsSalesByCategory, useAnalyticsSalesByRegion, useAnalyticsSummary, useAnalyticsTopProducts, useExportAnalyticsReport } from '../../hooks/useAnalyticsSummary'
import notify from '../../lib/notify'
import { getDefaultAnalyticsDateRange } from '../../utils/analyticsUtils'

const CURRENT_YEAR = new Date().getFullYear()

export default function Analytics() {
  const [devDataEnabled, setDevDataEnabled] = useState(false)
  const [dateRange, setDateRange] = useState(getDefaultAnalyticsDateRange)
  const [revenueYear, setRevenueYear] = useState(CURRENT_YEAR)
  const [categoryYear, setCategoryYear] = useState(CURRENT_YEAR)
  const [customerYear, setCustomerYear] = useState(CURRENT_YEAR)
  const [regionYear, setRegionYear] = useState(CURRENT_YEAR)
  const [productsYear, setProductsYear] = useState(CURRENT_YEAR)
  const [fulfillmentYear, setFulfillmentYear] = useState(CURRENT_YEAR)

  const [exportOpen, setExportOpen] = useState(false)
  const exportReportMutation = useExportAnalyticsReport()

  const {
    data: apiSummary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    error: summaryError,
    refetch: refetchSummary,
    isFetching: isSummaryFetching,
  } = useAnalyticsSummary({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    enabled: !devDataEnabled,
  })

  const {
    data: apiRevenueOrders,
    isLoading: isRevenueLoading,
    isError: isRevenueError,
    error: revenueError,
    refetch: refetchRevenue,
    isFetching: isRevenueFetching,
  } = useAnalyticsRevenueOrders({
    year: revenueYear,
    enabled: !devDataEnabled,
  })

  const {
    data: apiSalesByCategory,
    isLoading: isCategoryLoading,
    isError: isCategoryError,
    error: categoryError,
    refetch: refetchCategory,
    isFetching: isCategoryFetching,
  } = useAnalyticsSalesByCategory({
    year: categoryYear,
    enabled: !devDataEnabled,
  })

  const {
    data: apiCustomerGrowth,
    isLoading: isCustomerLoading,
    isError: isCustomerError,
    error: customerError,
    refetch: refetchCustomer,
    isFetching: isCustomerFetching,
  } = useAnalyticsCustomerGrowth({
    year: customerYear,
    enabled: !devDataEnabled,
  })

  const {
    data: apiSalesByRegion,
    isLoading: isRegionLoading,
    isError: isRegionError,
    error: regionError,
    refetch: refetchRegion,
    isFetching: isRegionFetching,
  } = useAnalyticsSalesByRegion({
    year: regionYear,
    enabled: !devDataEnabled,
  })

  const {
    data: apiTopProducts,
    isLoading: isProductsLoading,
    isError: isProductsError,
    error: productsError,
    refetch: refetchProducts,
    isFetching: isProductsFetching,
  } = useAnalyticsTopProducts({
    year: productsYear,
    enabled: !devDataEnabled,
  })

  const {
    data: apiFulfillment,
    isLoading: isFulfillmentLoading,
    isError: isFulfillmentError,
    error: fulfillmentError,
    refetch: refetchFulfillment,
    isFetching: isFulfillmentFetching,
  } = useAnalyticsFulfillment({
    year: fulfillmentYear,
    enabled: !devDataEnabled,
  })

  const summary = devDataEnabled
    ? DEV_ANALYTICS.summary
    : (apiSummary?.summary ?? EMPTY_ANALYTICS_SUMMARY)
  const previousSummary = devDataEnabled
    ? DEV_ANALYTICS.previousSummary
    : (apiSummary?.previousSummary ?? EMPTY_ANALYTICS_SUMMARY)

  const revenueTimeline = devDataEnabled
    ? DEV_ANALYTICS.revenueTimeline
    : (apiRevenueOrders?.series ?? EMPTY_ANALYTICS.revenueTimeline)
  const revenueTotal = devDataEnabled ? undefined : apiRevenueOrders?.totalRevenue

  const categoryBreakdown = devDataEnabled
    ? DEV_ANALYTICS.categoryBreakdown
    : (apiSalesByCategory?.categories ?? EMPTY_ANALYTICS.categoryBreakdown)
  const categoryTotal = devDataEnabled ? undefined : apiSalesByCategory?.totalRevenue

  const customerGrowth = devDataEnabled
    ? DEV_ANALYTICS.customerGrowth
    : (apiCustomerGrowth?.series ?? EMPTY_ANALYTICS.customerGrowth)

  const salesByRegion = devDataEnabled
    ? DEV_ANALYTICS.salesByRegion
    : (apiSalesByRegion?.regions ?? EMPTY_ANALYTICS.salesByRegion)
  const regionTotal = devDataEnabled ? undefined : apiSalesByRegion?.totalRevenue

  const topProducts = devDataEnabled
    ? DEV_ANALYTICS.topProducts
    : (apiTopProducts?.products ?? EMPTY_ANALYTICS.topProducts)

  const fulfillmentStats = devDataEnabled
    ? DEV_ANALYTICS.fulfillmentStats
    : (apiFulfillment?.stats ?? EMPTY_ANALYTICS.fulfillmentStats)
  const fulfillmentTotal = devDataEnabled ? undefined : apiFulfillment?.total

  const showSummaryLoader = !devDataEnabled && isSummaryLoading
  const showSummaryError = !devDataEnabled && isSummaryError
  const showRevenueLoader = !devDataEnabled && isRevenueLoading
  const showRevenueError = !devDataEnabled && isRevenueError
  const showCategoryLoader = !devDataEnabled && isCategoryLoading
  const showCategoryError = !devDataEnabled && isCategoryError
  const showCustomerLoader = !devDataEnabled && isCustomerLoading
  const showCustomerError = !devDataEnabled && isCustomerError
  const showRegionLoader = !devDataEnabled && isRegionLoading
  const showRegionError = !devDataEnabled && isRegionError
  const showProductsLoader = !devDataEnabled && isProductsLoading
  const showProductsError = !devDataEnabled && isProductsError
  const showFulfillmentLoader = !devDataEnabled && isFulfillmentLoading
  const showFulfillmentError = !devDataEnabled && isFulfillmentError

  useEffect(() => {
    if (!devDataEnabled && isSummaryError) {
      notify.fromError(summaryError, 'Unable to load analytics summary')
    }
  }, [devDataEnabled, isSummaryError, summaryError])

  useEffect(() => {
    if (!devDataEnabled && isRevenueError) {
      notify.fromError(revenueError, 'Unable to load revenue and orders')
    }
  }, [devDataEnabled, isRevenueError, revenueError])

  useEffect(() => {
    if (!devDataEnabled && isCategoryError) {
      notify.fromError(categoryError, 'Unable to load sales by category')
    }
  }, [devDataEnabled, isCategoryError, categoryError])

  useEffect(() => {
    if (!devDataEnabled && isCustomerError) {
      notify.fromError(customerError, 'Unable to load customer growth')
    }
  }, [devDataEnabled, isCustomerError, customerError])

  useEffect(() => {
    if (!devDataEnabled && isRegionError) {
      notify.fromError(regionError, 'Unable to load sales by region')
    }
  }, [devDataEnabled, isRegionError, regionError])

  useEffect(() => {
    if (!devDataEnabled && isProductsError) {
      notify.fromError(productsError, 'Unable to load top products')
    }
  }, [devDataEnabled, isProductsError, productsError])

  useEffect(() => {
    if (!devDataEnabled && isFulfillmentError) {
      notify.fromError(fulfillmentError, 'Unable to load order fulfilment')
    }
  }, [devDataEnabled, isFulfillmentError, fulfillmentError])

  const handleDevDataToggle = (enabled) => {
    setDevDataEnabled(enabled)
    notify.info(enabled ? 'Loaded dummy analytics data.' : 'Showing live analytics data.')
  }

  const handleExport = async ({ reportKey, reportLabel, startDate, endDate }) => {
    try {
      await exportReportMutation.mutateAsync({
        report: reportKey,
        startDate,
        endDate,
      })
      setExportOpen(false)
      notify.success(`${reportLabel} exported.`)
    } catch (error) {
      notify.fromError(error, 'Unable to export report')
    }
  }

  return (
    <DashboardLayout pageTitle="Analytics & Reports">
      <div className="page-enter space-y-6">
        <AnalyticsPageHeader
          devDataEnabled={devDataEnabled}
          onDevDataChange={handleDevDataToggle}
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onDateRangeChange={setDateRange}
          onExport={() => setExportOpen(true)}
        />

        <AnalyticsExportDrawer
          open={exportOpen}
          onClose={() => {
            if (exportReportMutation.isPending) return
            setExportOpen(false)
          }}
          initialRange={dateRange}
          onExport={handleExport}
          isExporting={exportReportMutation.isPending}
        />

        {showSummaryLoader ? (
          <AnalyticsSummaryCardsLoader />
        ) : showSummaryError ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-100">
              <AlertTriangle className="size-5" />
            </span>
            <h2 className="mt-4 text-base font-bold text-slate-900">Unable to load summary</h2>
            <p className="mt-1 text-sm text-slate-500">
              {summaryError?.message ?? 'Something went wrong while fetching analytics totals.'}
            </p>
            <button
              type="button"
              onClick={() => refetchSummary()}
              className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <RefreshCw className={`size-4 ${isSummaryFetching ? 'animate-spin' : ''}`} />
              Retry
            </button>
          </div>
        ) : (
          <AnalyticsSummaryCards
            summary={summary}
            previousSummary={previousSummary}
          />
        )}

        <div className="grid items-stretch gap-6 xl:grid-cols-3">
          <RevenueOrdersChart
            timeline={revenueTimeline}
            totalRevenue={revenueTotal}
            hasData={revenueTimeline.length > 0}
            year={revenueYear}
            onYearChange={setRevenueYear}
            isLoading={showRevenueLoader}
            isError={showRevenueError}
            error={revenueError}
            onRetry={() => refetchRevenue()}
            isFetching={isRevenueFetching}
          />
          <CategoryBreakdownChart
            categories={categoryBreakdown}
            totalRevenue={categoryTotal}
            hasData={categoryBreakdown.length > 0}
            year={categoryYear}
            onYearChange={setCategoryYear}
            isLoading={showCategoryLoader}
            isError={showCategoryError}
            error={categoryError}
            onRetry={() => refetchCategory()}
            isFetching={isCategoryFetching}
          />
        </div>

        <div className="grid items-stretch gap-6 lg:grid-cols-2">
          <CustomerGrowthChart
            data={customerGrowth}
            hasData={customerGrowth.length > 0}
            year={customerYear}
            onYearChange={setCustomerYear}
            isLoading={showCustomerLoader}
            isError={showCustomerError}
            error={customerError}
            onRetry={() => refetchCustomer()}
            isFetching={isCustomerFetching}
          />
          <SalesByRegionChart
            regions={salesByRegion}
            totalRevenue={regionTotal}
            hasData={salesByRegion.length > 0}
            year={regionYear}
            onYearChange={setRegionYear}
            isLoading={showRegionLoader}
            isError={showRegionError}
            error={regionError}
            onRetry={() => refetchRegion()}
            isFetching={isRegionFetching}
          />
        </div>

        <div className="grid items-stretch gap-6 lg:grid-cols-3">
          <div className="flex h-full min-h-0 flex-col lg:col-span-2">
            <TopProductsTable
              products={topProducts}
              hasData={topProducts.length > 0}
              year={productsYear}
              onYearChange={setProductsYear}
              isLoading={showProductsLoader}
              isError={showProductsError}
              error={productsError}
              onRetry={() => refetchProducts()}
              isFetching={isProductsFetching}
            />
          </div>
          <FulfillmentOverview
            stats={fulfillmentStats}
            total={fulfillmentTotal}
            hasData={devDataEnabled || Boolean(apiFulfillment)}
            year={fulfillmentYear}
            onYearChange={setFulfillmentYear}
            isLoading={showFulfillmentLoader}
            isError={showFulfillmentError}
            error={fulfillmentError}
            onRetry={() => refetchFulfillment()}
            isFetching={isFulfillmentFetching}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}
