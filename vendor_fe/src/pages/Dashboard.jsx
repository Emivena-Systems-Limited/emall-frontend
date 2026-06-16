import { useSelector } from 'react-redux'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import DashboardKpiGrid from '../components/dashboard/DashboardKpiGrid'
import SalesOverviewChart from '../components/dashboard/SalesOverviewChart'
import RevenueLineChart from '../components/dashboard/RevenueLineChart'
import FulfillmentAreaChart from '../components/dashboard/FulfillmentAreaChart'
import RecentOrdersList from '../components/dashboard/RecentOrdersList'
import SalesCategoryChart from '../components/dashboard/SalesCategoryChart'
import LowStockAlert from '../components/dashboard/LowStockAlert'
import TopSellingProducts from '../components/dashboard/TopSellingProducts'
import VendorNotifications from '../components/dashboard/VendorNotifications'
import YearlyOrderBarChart from '../components/dashboard/YearlyOrderBarChart'
import QuickActions from '../components/dashboard/QuickActions'
import { useDashboardYearFilters } from '../hooks/useDashboardYearFilters'
import { useSalesOverviewRange } from '../hooks/useSalesOverviewRange'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const { user } = useSelector((state) => state.auth)
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const {
    revenueYear,
    setRevenueYear,
    fulfillmentYear,
    setFulfillmentYear,
    categoryYear,
    setCategoryYear,
    activityYear,
    setActivityYear,
  } = useDashboardYearFilters()
  const {
    range: salesRange,
    setRange: setSalesRange,
    customRange: salesCustomRange,
    setCustomStartDate,
    setCustomEndDate,
  } = useSalesOverviewRange()

  return (
    <DashboardLayout pageTitle="Overview">
      <div className="page-enter space-y-5">
        <DashboardHeader user={user} greeting={getGreeting()} today={today} />

        <DashboardKpiGrid />

        <SalesOverviewChart
          range={salesRange}
          onRangeChange={setSalesRange}
          customRange={salesCustomRange}
          onCustomStartChange={setCustomStartDate}
          onCustomEndChange={setCustomEndDate}
        />

        <div className="grid gap-5 xl:grid-cols-5">
          <RevenueLineChart year={revenueYear} onYearChange={setRevenueYear} />
          <FulfillmentAreaChart year={fulfillmentYear} onYearChange={setFulfillmentYear} />
        </div>

        <div className="grid gap-5 lg:grid-cols-5 lg:items-stretch">
          <div className="lg:col-span-3">
            <RecentOrdersList />
          </div>
          <SalesCategoryChart year={categoryYear} onYearChange={setCategoryYear} />
        </div>

        <div className="grid gap-5 lg:grid-cols-2 lg:items-stretch">
          <TopSellingProducts />
          <LowStockAlert />
        </div>

        <YearlyOrderBarChart year={activityYear} onYearChange={setActivityYear} />
        <VendorNotifications />
        <QuickActions />
      </div>
    </DashboardLayout>
  )
}
