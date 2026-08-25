import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import AnalyticsPageHeader from '../../components/analytics/AnalyticsPageHeader'
import AnalyticsExportDrawer from '../../components/analytics/AnalyticsExportDrawer'
import AnalyticsSummaryCards from '../../components/analytics/AnalyticsSummaryCards'
import AnalyticsSummaryCardsLoader from '../../components/analytics/AnalyticsSummaryCardsLoader'
import {
  AnalyticsEmptyHero,
  CategoryBreakdownChart,
  CustomerGrowthChart,
  FulfillmentOverview,
  RevenueOrdersChart,
  SalesByRegionChart,
  TopProductsTable,
} from '../../components/analytics/AnalyticsCharts'
import { DEV_ANALYTICS, EMPTY_ANALYTICS, EMPTY_ANALYTICS_SUMMARY } from '../../constants/analyticsData'
import { useAnalyticsRevenueOrders, useAnalyticsSummary } from '../../hooks/useAnalyticsSummary'
import notify from '../../lib/notify'
import {
  exportAnalyticsReport,
  getDefaultAnalyticsDateRange,
} from '../../utils/analyticsUtils'

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

  const remainingChartData = devDataEnabled ? DEV_ANALYTICS : EMPTY_ANALYTICS
  const hasRemainingChartData = devDataEnabled

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

  const exportData = useMemo(
    () => ({
      ...remainingChartData,
      summary,
      previousSummary,
      revenueTimeline,
    }),
    [remainingChartData, summary, previousSummary, revenueTimeline],
  )

  const showSummaryLoader = !devDataEnabled && isSummaryLoading
  const showSummaryError = !devDataEnabled && isSummaryError
  const showRevenueLoader = !devDataEnabled && isRevenueLoading
  const showRevenueError = !devDataEnabled && isRevenueError

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

  const handleDevDataToggle = (enabled) => {
    setDevDataEnabled(enabled)
    notify.info(enabled ? 'Loaded dummy analytics data.' : 'Showing live analytics data.')
  }

  const handleExport = ({ reportKey, reportLabel, startDate, endDate, periodLabel }) => {
    exportAnalyticsReport(exportData, { reportKey, reportLabel, startDate, endDate, periodLabel })
    setExportOpen(false)
    notify.success(`${reportLabel} exported.`)
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
          onClose={() => setExportOpen(false)}
          initialRange={dateRange}
          onExport={handleExport}
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

        <div className="grid gap-6 xl:grid-cols-3">
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
            categories={remainingChartData.categoryBreakdown}
            hasData={hasRemainingChartData}
            year={categoryYear}
            onYearChange={setCategoryYear}
          />
        </div>

        {!hasRemainingChartData ? (
          <AnalyticsEmptyHero
            title="More reports coming soon"
            description="Customer growth, sales by region, top products, and fulfilment will appear here next."
          />
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-2">
              <CustomerGrowthChart
                data={remainingChartData.customerGrowth}
                hasData={hasRemainingChartData}
                year={customerYear}
                onYearChange={setCustomerYear}
              />
              <SalesByRegionChart
                regions={remainingChartData.salesByRegion}
                hasData={hasRemainingChartData}
                year={regionYear}
                onYearChange={setRegionYear}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <TopProductsTable
                  products={remainingChartData.topProducts}
                  hasData={hasRemainingChartData}
                  year={productsYear}
                  onYearChange={setProductsYear}
                />
              </div>
              <FulfillmentOverview
                stats={remainingChartData.fulfillmentStats}
                hasData={hasRemainingChartData}
                year={fulfillmentYear}
                onYearChange={setFulfillmentYear}
              />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
