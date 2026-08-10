import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { AlertTriangle, Loader2, Plus, RefreshCw } from 'lucide-react'
import ConfirmModal from '../../components/common/ConfirmModal'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import EmptyState from '../../components/dashboard/EmptyState'
import OrderPagination from '../../components/orders/OrderPagination'
import PromotionCatalogToolbar from '../../components/promotions/PromotionCatalogToolbar'
import PromotionFiltersDrawer, { countPromotionDrawerFilters } from '../../components/promotions/PromotionFiltersDrawer'
import PromotionSummaryCards from '../../components/promotions/PromotionSummaryCards'
import PromotionTable from '../../components/promotions/PromotionTable'
import {
  DEFAULT_PROMOTION_DATE_RANGE,
  PROMOTIONS_PAGE_SIZE,
  STATUS_FILTERS,
  SUMMARY_FILTERS,
} from '../../constants/promotions'
import { getPromotionCatalogSummary } from '../../mocks/promotionMockData'
import { EMPTY_STATE_PRESETS } from '../../constants/emptyStates'
import {
  useDeletePromotionMutation,
  useDuplicatePromotionMutation,
  usePromotions,
  useUpdatePromotionStatusMutation,
} from '../../hooks/usePromotions'
import notify from '../../lib/notify'
import { getPromotionActionCopy } from '../../utils/promotionActions'
import {
  filterPromotionCatalog,
  paginatePromotions,
} from '../../utils/promotionCatalogFilters'

export default function Promotions() {
  const navigate = useNavigate()
  const { data: promotions = [], isLoading, isError, error, refetch, isFetching } = usePromotions()

  const [search, setSearch] = useState('')
  const [summaryFilter, setSummaryFilter] = useState(SUMMARY_FILTERS.ALL)
  const [statusFilter, setStatusFilter] = useState(STATUS_FILTERS.ALL)
  const [dateRange, setDateRange] = useState(DEFAULT_PROMOTION_DATE_RANGE)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [actionRequest, setActionRequest] = useState(null)

  const duplicateMutation = useDuplicatePromotionMutation()
  const statusMutation = useUpdatePromotionStatusMutation()
  const deleteMutation = useDeletePromotionMutation()

  const summary = useMemo(() => getPromotionCatalogSummary(promotions), [promotions])

  const filteredPromotions = useMemo(
    () =>
      filterPromotionCatalog(promotions, {
        search,
        summaryFilter,
        statusFilter,
        dateRange,
      }),
    [promotions, search, summaryFilter, statusFilter, dateRange],
  )

  const drawerFilterCount = countPromotionDrawerFilters({ statusFilter, dateRange })

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
    setPage(1)
  }, [search, summaryFilter, statusFilter, dateRange])

  useEffect(() => {
    if (isError) {
      notify.fromError(error, 'Unable to load promotions')
    }
  }, [error, isError])

  const handleSummaryFilterChange = (filterKey) => {
    setSummaryFilter(filterKey)
    if (filterKey === SUMMARY_FILTERS.ACTIVE) setStatusFilter(STATUS_FILTERS.ACTIVE)
    else if (filterKey === SUMMARY_FILTERS.SCHEDULED) setStatusFilter(STATUS_FILTERS.SCHEDULED)
    else if (filterKey === SUMMARY_FILTERS.EXPIRED) setStatusFilter(STATUS_FILTERS.EXPIRED)
    else if (filterKey === SUMMARY_FILTERS.ALL) setStatusFilter(STATUS_FILTERS.ALL)
  }

  const handleStatusFilterChange = (nextStatus) => {
    setStatusFilter(nextStatus)

    if (nextStatus === STATUS_FILTERS.ALL) return

    if ([STATUS_FILTERS.ACTIVE, STATUS_FILTERS.SCHEDULED, STATUS_FILTERS.EXPIRED].includes(nextStatus)) {
      if ([SUMMARY_FILTERS.ALL, SUMMARY_FILTERS.ACTIVE, SUMMARY_FILTERS.SCHEDULED, SUMMARY_FILTERS.EXPIRED].includes(summaryFilter)) {
        setSummaryFilter(nextStatus)
      }
      return
    }

    if ([SUMMARY_FILTERS.ACTIVE, SUMMARY_FILTERS.SCHEDULED, SUMMARY_FILTERS.EXPIRED].includes(summaryFilter)) {
      setSummaryFilter(SUMMARY_FILTERS.ALL)
    }
  }

  const handleClearDrawerFilters = () => {
    setStatusFilter(STATUS_FILTERS.ALL)
    setDateRange(DEFAULT_PROMOTION_DATE_RANGE)
  }

  const handleDuplicate = async (promotion) => {
    try {
      const copy = await duplicateMutation.mutateAsync(promotion)
      notify.success(`"${copy.name}" created as a draft.`)
    } catch {
      notify.error('Unable to duplicate this promotion.')
    }
  }

  const handleConfirmAction = async () => {
    if (!actionRequest) return

    const { action, promotion } = actionRequest

    try {
      if (action === 'delete') {
        await deleteMutation.mutateAsync(promotion.id)
        notify.success(`"${promotion.name}" deleted.`)
      } else {
        const nextStatus = action === 'pause'
          ? 'paused'
          : action === 'resume'
            ? 'active'
            : 'expired'

        await statusMutation.mutateAsync({ promotionId: promotion.id, status: nextStatus })
        notify.success(`"${promotion.name}" updated.`)
      }
    } catch {
      notify.error('Unable to complete this action. Please try again.')
    } finally {
      setActionRequest(null)
    }
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

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-24 text-sm font-semibold text-slate-500">
            <Loader2 className="size-4 animate-spin text-brand" />
            Loading promotions…
          </div>
        ) : isError ? (
          <div className="mx-auto max-w-md space-y-5 rounded-2xl border border-slate-200 bg-white py-16 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-100">
              <AlertTriangle className="size-6" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-950">Unable to load promotions</h2>
              <p className="mt-2 text-sm text-slate-500">
                {error?.message ?? 'Something went wrong while loading your promotions.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
              Try Again
            </button>
          </div>
        ) : (
          <>
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
                  onOpenFilters={() => setFiltersOpen(true)}
                  activeFilterCount={drawerFilterCount}
                  statusFilter={statusFilter}
                  onStatusFilterChange={handleStatusFilterChange}
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                  onClearFilters={handleClearDrawerFilters}
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

            <PromotionFiltersDrawer
              open={filtersOpen}
              onClose={() => setFiltersOpen(false)}
              statusFilter={statusFilter}
              onStatusFilterChange={handleStatusFilterChange}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              onClearFilters={handleClearDrawerFilters}
              resultCount={filteredPromotions.length}
            />
          </>
        )}
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
