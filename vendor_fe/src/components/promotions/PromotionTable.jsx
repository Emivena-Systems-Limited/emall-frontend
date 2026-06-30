import { Tag } from 'lucide-react'
import { PROMOTION_TYPE_CONFIG } from '../../constants/promotions'
import PromotionActionsMenu from './PromotionActionsMenu'
import PromotionStatusBadge from './PromotionStatusBadge'

const TABLE_HEAD_CLASS =
  'whitespace-nowrap px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400'

function formatSchedule(startDate, endDate) {
  const format = (value) =>
    new Date(value).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  return `${format(startDate)} – ${format(endDate)}`
}

function formatMoney(amount) {
  return `GH₵ ${Number(amount).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`
}

function PromotionMobileCard({
  promotion,
  onDuplicate,
  onPause,
  onResume,
  onEnd,
  onDelete,
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900">{promotion.name}</p>
          <p className="mt-1 text-xs text-slate-500">
            {PROMOTION_TYPE_CONFIG[promotion.type]?.label ?? promotion.type}
          </p>
        </div>
        <PromotionActionsMenu
          promotion={promotion}
          onDuplicate={onDuplicate}
          onPause={onPause}
          onResume={onResume}
          onEnd={onEnd}
          onDelete={onDelete}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <PromotionStatusBadge status={promotion.status} />
      </div>

      <p className="mt-3 text-xs text-slate-500">{formatSchedule(promotion.startDate, promotion.endDate)}</p>
      <p className="mt-2 text-xs text-slate-600">
        Applies to: {promotion.appliesToLabels.join(', ')}
      </p>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-slate-600">{promotion.orders} orders</span>
        <span className="font-bold text-slate-900">{formatMoney(promotion.revenue)}</span>
      </div>
    </article>
  )
}

export default function PromotionTable({
  promotions,
  onDuplicate,
  onPause,
  onResume,
  onEnd,
  onDelete,
}) {
  if (promotions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 ring-1 ring-slate-200">
          <Tag className="size-6" strokeWidth={1.5} />
        </span>
        <p className="mt-4 text-sm font-semibold text-slate-800">No promotions match your filters</p>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          Try adjusting your search or filters, or create a new promotion.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3 p-4 lg:hidden">
        {promotions.map((promotion) => (
          <PromotionMobileCard
            key={promotion.id}
            promotion={promotion}
            onDuplicate={onDuplicate}
            onPause={onPause}
            onResume={onResume}
            onEnd={onEnd}
            onDelete={onDelete}
          />
        ))}
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-slate-100">
              <th className={TABLE_HEAD_CLASS}>Promotion</th>
              <th className={TABLE_HEAD_CLASS}>Type</th>
              <th className={TABLE_HEAD_CLASS}>Status</th>
              <th className={TABLE_HEAD_CLASS}>Schedule</th>
              <th className={TABLE_HEAD_CLASS}>Applies To</th>
              <th className={TABLE_HEAD_CLASS}>Orders</th>
              <th className={TABLE_HEAD_CLASS}>Revenue</th>
              <th className={TABLE_HEAD_CLASS}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {promotions.map((promotion) => (
              <tr key={promotion.id} className="text-sm text-slate-700">
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-900">{promotion.name}</p>
                  <p className="mt-0.5 max-w-xs truncate text-xs text-slate-500">{promotion.shortDescription}</p>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                  {PROMOTION_TYPE_CONFIG[promotion.type]?.label ?? promotion.type}
                </td>
                <td className="whitespace-nowrap px-5 py-4">
                  <PromotionStatusBadge status={promotion.status} />
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-600">
                  {formatSchedule(promotion.startDate, promotion.endDate)}
                </td>
                <td className="max-w-[180px] truncate px-5 py-4 text-xs text-slate-600">
                  {promotion.appliesToLabels.join(', ')}
                </td>
                <td className="whitespace-nowrap px-5 py-4">{promotion.orders}</td>
                <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">
                  {formatMoney(promotion.revenue)}
                </td>
                <td className="whitespace-nowrap px-5 py-4">
                  <PromotionActionsMenu
                    promotion={promotion}
                    onDuplicate={onDuplicate}
                    onPause={onPause}
                    onResume={onResume}
                    onEnd={onEnd}
                    onDelete={onDelete}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
