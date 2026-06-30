import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { Plus } from 'lucide-react'
import ConfirmModal from '../../components/common/ConfirmModal'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import EmptyState from '../../components/dashboard/EmptyState'
import OrderPagination from '../../components/orders/OrderPagination'
import PromotionCatalogToolbar from '../../components/promotions/PromotionCatalogToolbar'
import PromotionSummaryCards from '../../components/promotions/PromotionSummaryCards'
import PromotionTable from '../../components/promotions/PromotionTable'
import {
  PROMOTIONS_PAGE_SIZE,
  STATUS_FILTERS,
  SUMMARY_FILTERS,
} from '../../constants/promotions'
import {
  duplicatePromotionRecord,
  getPromotionCatalogSummary,
  getVendorPromotions,
  removeVendorPromotion,
  saveVendorPromotion,
} from '../../constants/promotionsData'
import { EMPTY_STATE_PRESETS } from '../../constants/emptyStates'
import notify from '../../lib/notify'
import { getPromotionActionCopy } from '../../utils/promotionActions'
import {
  filterPromotionCatalog,
  paginatePromotions,
} from '../../utils/promotionCatalogFilters'

export default function Promotions() {
  const navigate = useNavigate()
  const location = useLocation()
  const [promotions, setPromotions] = useState(getVendorPromotions)
  const [search, setSearch] = useState('')
  const [summaryFilter, setSummaryFilter] = useState(SUMMARY_FILTERS.ALL)
  const [statusFilter, setStatusFilter] = useState(STATUS_FILTERS.ALL)
  const [draftDateRange, setDraftDateRange] = useState({ startDate: '', endDate: '' })
  const [appliedDateRange, setAppliedDateRange] = useState({ startDate: '', endDate: '' })
  const [page, setPage] = useState(1)
  const [actionRequest, setActionRequest] = useState(null)

  const summary = useMemo(() => getPromotionCatalogSummary(promotions), [promotions])

  const filteredPromotions = useMemo(
    () =>
      filterPromotionCatalog(promotions, {
        search,
        summaryFilter,
        statusFilter,
        dateRange: appliedDateRange,
      }),
    [promotions, search, summaryFilter, statusFilter, appliedDateRange],
  )

  const pagination = useMemo(
    () => paginatePromotions(filteredPromotions, { page, pageSize: PROMOTIONS_PAGE_SIZE }),
    [filteredPromotions, page],
  )

  const preset = EMPTY_STATE_PRESETS.promotions
  const hasPromotions = promotions.length > 0
  const actionModalCopy = actionRequest
    ? getPromotionActionCopy(actionRequest.action, actionRequest.promotion)
    : null

  useEffect(() => {
    setPromotions(getVendorPromotions())
  }, [location.pathname])

  useEffect(() => {
    setPage(1)
  }, [search, summaryFilter, statusFilter, appliedDateRange])

  const handleSummaryFilterChange = (filterKey) => {
    setSummaryFilter(filterKey)
    if (filterKey === SUMMARY_FILTERS.ACTIVE) setStatusFilter(STATUS_FILTERS.ACTIVE)
    else if (filterKey === SUMMARY_FILTERS.SCHEDULED) setStatusFilter(STATUS_FILTERS.SCHEDULED)
    else if (filterKey === SUMMARY_FILTERS.EXPIRED) setStatusFilter(STATUS_FILTERS.EXPIRED)
    else if (filterKey === SUMMARY_FILTERS.ALL) setStatusFilter(STATUS_FILTERS.ALL)
  }

  const handleApplyFilters = () => {
    setAppliedDateRange(draftDateRange)
  }

  const handleResetFilters = () => {
    setSearch('')
    setSummaryFilter(SUMMARY_FILTERS.ALL)
    setStatusFilter(STATUS_FILTERS.ALL)
    setDraftDateRange({ startDate: '', endDate: '' })
    setAppliedDateRange({ startDate: '', endDate: '' })
  }

  const handleDuplicate = (promotion) => {
    const copy = duplicatePromotionRecord(promotion)
    saveVendorPromotion(copy)
    setPromotions(getVendorPromotions())
    notify.success(`"${copy.name}" created as a draft.`)
  }

  const handleConfirmAction = () => {
    if (!actionRequest) return

    const { action, promotion } = actionRequest

    if (action === 'delete') {
      removeVendorPromotion(promotion.id)
      notify.success(`"${promotion.name}" deleted.`)
    } else {
      const nextStatus = action === 'pause'
        ? 'paused'
        : action === 'resume'
          ? 'active'
          : 'expired'

      saveVendorPromotion({ ...promotion, status: nextStatus })
      notify.success(`"${promotion.name}" updated.`)
    }

    setPromotions(getVendorPromotions())
    setActionRequest(null)
  }

  return (
    <DashboardLayout pageTitle="Promotions">
      <div className="page-enter space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-950">Promotions</h1>
            <p className="mt-1 text-sm text-slate-500">
              Create and manage promotions to boost sales and attract more customers.
            </p>
          </div>
          <Link
            to="/promotions/new"
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover"
          >
            <Plus className="size-4" />
            Create Promotion
          </Link>
        </div>

        <PromotionSummaryCards
          summary={summary}
          activeFilter={summaryFilter}
          onFilterChange={handleSummaryFilterChange}
        />

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
          <div className="border-b border-slate-100 px-5 py-4">
            <PromotionCatalogToolbar
              search={search}
              onSearchChange={setSearch}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              dateRange={draftDateRange}
              onDateRangeChange={setDraftDateRange}
              onApplyFilters={handleApplyFilters}
              onResetFilters={handleResetFilters}
            />
          </div>

          {!hasPromotions ? (
            <EmptyState
              icon={preset.icon}
              title={preset.title}
              description={preset.description}
              action={
                <button
                  type="button"
                  onClick={() => navigate('/promotions/new')}
                  className="cursor-pointer rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-hover"
                >
                  Create Promotion
                </button>
              }
            />
          ) : (
            <>
              <PromotionTable
                promotions={pagination.items}
                onDuplicate={handleDuplicate}
                onPause={(promotion) => setActionRequest({ action: 'pause', promotion })}
                onResume={(promotion) => setActionRequest({ action: 'resume', promotion })}
                onEnd={(promotion) => setActionRequest({ action: 'end', promotion })}
                onDelete={(promotion) => setActionRequest({ action: 'delete', promotion })}
              />
              <OrderPagination
                page={pagination.page}
                pageCount={pagination.pageCount}
                totalItems={pagination.totalItems}
                startIndex={pagination.startIndex}
                endIndex={pagination.endIndex}
                onPageChange={setPage}
                itemLabel="promotions"
              />
            </>
          )}
        </section>
      </div>

      <ConfirmModal
        open={Boolean(actionModalCopy)}
        title={actionModalCopy?.title}
        description={actionModalCopy?.description}
        confirmLabel={actionModalCopy?.confirmLabel}
        tone={actionModalCopy?.tone}
        onConfirm={handleConfirmAction}
        onClose={() => setActionRequest(null)}
      />
    </DashboardLayout>
  )
}
