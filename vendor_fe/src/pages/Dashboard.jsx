import { useSelector } from 'react-redux'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import DashboardKpiGrid from '../components/dashboard/DashboardKpiGrid'
import DashboardLoader from '../components/dashboard/DashboardLoader'
import DashboardReveal from '../components/dashboard/DashboardReveal'
import SalesOverviewChart from '../components/dashboard/SalesOverviewChart'
// import RevenueLineChart from '../components/dashboard/RevenueLineChart'
// import FulfillmentAreaChart from '../components/dashboard/FulfillmentAreaChart'
import RecentOrdersList from '../components/dashboard/RecentOrdersList'
//  import SalesCategoryChart from '../components/dashboard/SalesCategoryChart'
import LowStockAlert from '../components/dashboard/LowStockAlert'
import TopSellingProducts from '../components/dashboard/TopSellingProducts'
import VendorNotifications from '../components/dashboard/VendorNotifications'
// import YearlyOrderBarChart from '../components/dashboard/YearlyOrderBarChart'
import QuickActions from '../components/dashboard/QuickActions'
import { useDashboardReveal } from '../hooks/useDashboardReveal'
// import { useDashboardYearFilters } from '../hooks/useDashboardYearFilters'
import { useSalesOverviewRange } from '../hooks/useSalesOverviewRange'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const { user } = useSelector((state) => state.auth)
  const { isLoading } = useDashboardReveal()
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  // const {
    // revenueYear,
    // setRevenueYear,
    // fulfillmentYear,
    // setFulfillmentYear,
    // categoryYear,
    // setCategoryYear,
    // activityYear,
    // setActivityYear,
  // } = useDashboardYearFilters()
  const {
    range: salesRange,
    setRange: setSalesRange,
    customRange: salesCustomRange,
    setCustomStartDate,
    setCustomEndDate,
  } = useSalesOverviewRange()

  return (
    <DashboardLayout pageTitle="Overview">
      {isLoading ? (
        <DashboardLoader />
      ) : (
        <div className="space-y-5">
          <DashboardReveal index={0}>
            <DashboardHeader user={user} greeting={getGreeting()} today={today} />
          </DashboardReveal>

          <DashboardReveal index={1}>
            <DashboardKpiGrid />
          </DashboardReveal>

          <DashboardReveal index={2}>
            <SalesOverviewChart
              range={salesRange}
              onRangeChange={setSalesRange}
              customRange={salesCustomRange}
              onCustomStartChange={setCustomStartDate}
              onCustomEndChange={setCustomEndDate}
            />
          </DashboardReveal>

          {/* <DashboardReveal index={3}>
            <div className="grid gap-5 xl:grid-cols-5">
              <RevenueLineChart year={revenueYear} onYearChange={setRevenueYear} />
              <FulfillmentAreaChart year={fulfillmentYear} onYearChange={setFulfillmentYear} />
            </div>
          </DashboardReveal> */}

          <DashboardReveal index={4}>
            <div className="grid gap-5 lg:grid-cols-5 lg:items-stretch">
              <div className="lg:col-span-5">
                <RecentOrdersList />
              </div>
              {/* <SalesCategoryChart year={categoryYear} onYearChange={setCategoryYear} /> */}
            </div>
          </DashboardReveal>

          <DashboardReveal index={5}>
            <div className="grid gap-5 lg:grid-cols-2 lg:items-stretch">
              <TopSellingProducts />
              <LowStockAlert />
            </div>
          </DashboardReveal>

          {/* <DashboardReveal index={6}>
            <YearlyOrderBarChart year={activityYear} onYearChange={setActivityYear} />
          </DashboardReveal> */}

          <DashboardReveal index={7}>
            <VendorNotifications />
          </DashboardReveal>

          <DashboardReveal index={8}>
            <QuickActions />
          </DashboardReveal>
        </div>
      )}
    </DashboardLayout>
  )
}
