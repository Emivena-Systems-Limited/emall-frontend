import { useMemo, useState } from 'react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import AnalyticsPageHeader from '../../components/analytics/AnalyticsPageHeader'
import AnalyticsSummaryCards from '../../components/analytics/AnalyticsSummaryCards'
import {
  AnalyticsEmptyHero,
  AnalyticsInsights,
  CategoryBreakdownChart,
  CustomerGrowthChart,
  FulfillmentOverview,
  RevenueOrdersChart,
  TopProductsTable,
  TrafficSourcesChart,
} from '../../components/analytics/AnalyticsCharts'
import { DEV_ANALYTICS, EMPTY_ANALYTICS } from '../../constants/analyticsData'
import notify from '../../lib/notify'
import {
  exportAnalyticsCsv,
  hasAnalyticsData,
  sliceTimelineByRange,
} from '../../utils/analyticsUtils'

export default function Analytics() {
  const [devDataEnabled, setDevDataEnabled] = useState(false)
  const [data, setData] = useState(EMPTY_ANALYTICS)
  const [dateRange, setDateRange] = useState('12m')

  const hasData = useMemo(() => hasAnalyticsData(data), [data])

  const timeline = useMemo(
    () => sliceTimelineByRange(data.revenueTimeline, dateRange),
    [data.revenueTimeline, dateRange],
  )

  const customerGrowth = useMemo(
    () => sliceTimelineByRange(data.customerGrowth, dateRange),
    [data.customerGrowth, dateRange],
  )

  const handleDevDataToggle = (enabled) => {
    setDevDataEnabled(enabled)
    setData(enabled ? structuredClone(DEV_ANALYTICS) : structuredClone(EMPTY_ANALYTICS))
    notify.info(enabled ? 'Loaded dummy analytics data.' : 'Cleared analytics data.')
  }

  const handleExport = () => {
    if (!hasData) {
      notify.info('No analytics data to export.')
      return
    }
    exportAnalyticsCsv(data)
    notify.success('Analytics report exported.')
  }

  return (
    <DashboardLayout pageTitle="Analytics & Reports">
      <div className="page-enter space-y-6">
        <AnalyticsPageHeader
          devDataEnabled={devDataEnabled}
          onDevDataChange={handleDevDataToggle}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onExport={handleExport}
          hasData={hasData}
        />

        {!hasData ? (
          <AnalyticsEmptyHero />
        ) : (
          <>
            <AnalyticsSummaryCards
              summary={data.summary}
              previousSummary={data.previousSummary}
            />

            <AnalyticsInsights insights={data.insights} hasData={hasData} />

            <div className="grid gap-6 xl:grid-cols-3">
              <RevenueOrdersChart timeline={timeline} hasData={hasData} />
              <CategoryBreakdownChart categories={data.categoryBreakdown} hasData={hasData} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <CustomerGrowthChart data={customerGrowth} hasData={hasData} />
              <TrafficSourcesChart sources={data.trafficSources} hasData={hasData} />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <TopProductsTable products={data.topProducts} hasData={hasData} />
              </div>
              <FulfillmentOverview stats={data.fulfillmentStats} hasData={hasData} />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
