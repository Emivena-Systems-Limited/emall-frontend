import { useMemo, useState } from 'react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import AnalyticsPageHeader from '../../components/analytics/AnalyticsPageHeader'
import AnalyticsExportDrawer from '../../components/analytics/AnalyticsExportDrawer'
import AnalyticsSummaryCards from '../../components/analytics/AnalyticsSummaryCards'
import {
  AnalyticsEmptyHero,
  CategoryBreakdownChart,
  CustomerGrowthChart,
  FulfillmentOverview,
  RevenueOrdersChart,
  SalesByRegionChart,
  TopProductsTable,
} from '../../components/analytics/AnalyticsCharts'
import { DEV_ANALYTICS, EMPTY_ANALYTICS } from '../../constants/analyticsData'
import notify from '../../lib/notify'
import {
  exportAnalyticsReport,
  getDefaultAnalyticsDateRange,
  hasAnalyticsData,
} from '../../utils/analyticsUtils'

const CURRENT_YEAR = new Date().getFullYear()

export default function Analytics() {
  const [devDataEnabled, setDevDataEnabled] = useState(false)
  const [data, setData] = useState(EMPTY_ANALYTICS)
  const [dateRange, setDateRange] = useState(getDefaultAnalyticsDateRange)
  const [revenueYear, setRevenueYear] = useState(CURRENT_YEAR)
  const [categoryYear, setCategoryYear] = useState(CURRENT_YEAR)
  const [customerYear, setCustomerYear] = useState(CURRENT_YEAR)
  const [regionYear, setRegionYear] = useState(CURRENT_YEAR)
  const [productsYear, setProductsYear] = useState(CURRENT_YEAR)
  const [fulfillmentYear, setFulfillmentYear] = useState(CURRENT_YEAR)

  const [exportOpen, setExportOpen] = useState(false)

  const hasData = useMemo(() => hasAnalyticsData(data), [data])

  const handleDevDataToggle = (enabled) => {
    setDevDataEnabled(enabled)
    setData(enabled ? structuredClone(DEV_ANALYTICS) : structuredClone(EMPTY_ANALYTICS))
    notify.info(enabled ? 'Loaded dummy analytics data.' : 'Cleared analytics data.')
  }

  const handleExport = ({ reportKey, reportLabel, startDate, endDate, periodLabel }) => {
    exportAnalyticsReport(data, { reportKey, reportLabel, startDate, endDate, periodLabel })
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

        {!hasData ? (
          <AnalyticsEmptyHero />
        ) : (
          <>
            <AnalyticsSummaryCards
              summary={data.summary}
              previousSummary={data.previousSummary}
            />

            <div className="grid gap-6 xl:grid-cols-3">
              <RevenueOrdersChart
                timeline={data.revenueTimeline}
                hasData={hasData}
                year={revenueYear}
                onYearChange={setRevenueYear}
              />
              <CategoryBreakdownChart
                categories={data.categoryBreakdown}
                hasData={hasData}
                year={categoryYear}
                onYearChange={setCategoryYear}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <CustomerGrowthChart
                data={data.customerGrowth}
                hasData={hasData}
                year={customerYear}
                onYearChange={setCustomerYear}
              />
              <SalesByRegionChart
                regions={data.salesByRegion}
                hasData={hasData}
                year={regionYear}
                onYearChange={setRegionYear}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <TopProductsTable
                  products={data.topProducts}
                  hasData={hasData}
                  year={productsYear}
                  onYearChange={setProductsYear}
                />
              </div>
              <FulfillmentOverview
                stats={data.fulfillmentStats}
                hasData={hasData}
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
