import { useMemo } from 'react'
import { Link } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { accountOverviewStatistics } from '../accountNavigation'
import { useOrdersQuery } from '../../../hooks/useOrdersQuery'
import { extractOrdersPagination, isOrderAwaitingDelivery, normalizeOrdersResponse } from '../../../utils/normalizeOrders'

export default function AccountStatisticCards() {
  const ordersQuery = useOrdersQuery()
  const orders = useMemo(() => normalizeOrdersResponse(ordersQuery.data), [ordersQuery.data])
  const pagination = useMemo(() => extractOrdersPagination(ordersQuery.data), [ordersQuery.data])

  const statistics = useMemo(
    () =>
      accountOverviewStatistics.map((item) => {
        if (item.label === 'Total Orders') {
          return { ...item, value: String(pagination.total) }
        }

        if (item.label === 'Pending Deliveries') {
          const pending = orders.filter((order) => isOrderAwaitingDelivery(order)).length
          return { ...item, value: String(pending) }
        }

        return item
      }),
    [orders, pagination.total],
  )

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statistics.map((item) => {
        const Icon = item.icon

        return (
          <article
            key={item.label}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-1 hover:border-auth-primary/20 hover:shadow-[0_15px_35px_rgba(15,23,42,0.08)]"
          >
            <div className="flex items-start justify-between gap-3">
              <span className={`flex size-11 items-center justify-center rounded-xl ${item.tone}`}>
                <Icon className="size-5" />
              </span>
              <span className="text-3xl font-bold tracking-tight text-slate-950">{item.value}</span>
            </div>
            <h3 className="mt-4 text-sm font-semibold text-slate-600">{item.label}</h3>
            <Link
              to={item.href}
              className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-auth-primary hover:underline"
            >
              {item.link}
              <ChevronRight className="size-3.5" />
            </Link>
          </article>
        )
      })}
    </section>
  )
}
