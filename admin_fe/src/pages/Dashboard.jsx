import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import AdminHeader from '../components/dashboard/AdminHeader'
import AdminKpiGrid from '../components/dashboard/AdminKpiGrid'
import AttentionQueue from '../components/dashboard/AttentionQueue'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import DashboardLoader from '../components/dashboard/DashboardLoader'
import DashboardReveal from '../components/dashboard/DashboardReveal'
import SalesMixChart from '../components/dashboard/SalesMixChart'
import LiveOrdersFeed from '../components/dashboard/LiveOrdersFeed'
import OrderStatusChart from '../components/dashboard/OrderStatusChart'
import RegionalSalesChart from '../components/dashboard/RegionalSalesChart'
import VendorPipeline from '../components/dashboard/VendorPipeline'
import { useDashboardReveal } from '../hooks/useDashboardReveal'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const { user } = useSelector((state) => state.auth)
  const { isLoading } = useDashboardReveal()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000)
    return () => window.clearInterval(timer)
  }, [])

  const today = now.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const clock = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <DashboardLayout pageTitle="Command center">
      {isLoading ? (
        <DashboardLoader />
      ) : (
        <div className="space-y-5">
          <DashboardReveal index={0}>
            <AdminHeader user={user} greeting={getGreeting()} today={today} clock={clock} />
          </DashboardReveal>

          <DashboardReveal index={1}>
            <AdminKpiGrid />
          </DashboardReveal>

          <DashboardReveal index={2}>
            <div className="grid items-stretch gap-5 lg:grid-cols-5">
              <div className="h-full lg:col-span-3">
                <SalesMixChart />
              </div>
              <div className="h-full lg:col-span-2">
                <AttentionQueue />
              </div>
            </div>
          </DashboardReveal>

          <DashboardReveal index={3}>
            <OrderStatusChart />
          </DashboardReveal>

          <DashboardReveal index={4}>
            <RegionalSalesChart />
          </DashboardReveal>

          <DashboardReveal index={5}>
            <div className="grid items-stretch gap-5 lg:grid-cols-5">
              <div className="h-full lg:col-span-3">
                <LiveOrdersFeed />
              </div>
              <div className="h-full lg:col-span-2">
                <VendorPipeline />
              </div>
            </div>
          </DashboardReveal>
        </div>
      )}
    </DashboardLayout>
  )
}
