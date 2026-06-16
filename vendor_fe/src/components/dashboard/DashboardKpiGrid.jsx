import { AlertTriangle, Clock3, ShoppingCart, TrendingUp } from 'lucide-react'
import { KPI_STATS } from '../../constants/dashboardData'
import KpiCard from './KpiCard'

const KPI_ICONS = {
  revenue: TrendingUp,
  ordersToday: ShoppingCart,
  pendingOrders: Clock3,
  lowStock: AlertTriangle,
}

export default function DashboardKpiGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {KPI_STATS.map((stat) => (
        <KpiCard
          key={stat.id}
          icon={KPI_ICONS[stat.iconKey]}
          label={stat.label}
          value={stat.value}
          changeText={stat.changeText}
          helper={stat.helper}
          isPositive={stat.isPositive}
          isNeutral={stat.isPositive === undefined}
          sparkKey={stat.sparkKey}
          accentColor={stat.accentColor}
        />
      ))}
    </div>
  )
}
