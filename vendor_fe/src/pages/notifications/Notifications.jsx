import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import ConfirmModal from '../../components/common/ConfirmModal'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import NotificationCategoryTabs from '../../components/notifications/NotificationCategoryTabs'
import NotificationEmptyState from '../../components/notifications/NotificationEmptyState'
import NotificationList, { NotificationListSkeleton } from '../../components/notifications/NotificationList'
import NotificationsPageHeader from '../../components/notifications/NotificationsPageHeader'
import NotificationStatusFilters from '../../components/notifications/NotificationStatusFilters'
import { useVendorNotifications } from '../../components/notifications/VendorNotificationsProvider'
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CATEGORY_TABS,
  NOTIFICATION_PAGE_SIZE,
  NOTIFICATION_STATUSES,
} from '../../constants/notifications'
import {
  useClearReadNotificationsMutation,
  useDeleteNotificationMutation,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useVendorNotificationsList,
} from '../../hooks/useNotifications'
import notify from '../../lib/notify'
import { parseApiError } from '../../utils/parseApiError'
import {
  countByCategory,
  filterNotifications,
  sortNotifications,
} from '../../utils/notificationUtils'

function isValidCategory(value) {
  return Object.values(NOTIFICATION_CATEGORIES).includes(value)
}

function isValidStatus(value) {
  return Object.values(NOTIFICATION_STATUSES).includes(value)
}

function categoryCountsForView({
  devDataEnabled,
  localCounts,
  apiCounts,
  category,
  status,
  total,
}) {
  if (devDataEnabled) return localCounts
  if (apiCounts) return apiCounts

  const counts = Object.fromEntries(
    Object.values(NOTIFICATION_CATEGORIES).map((id) => [id, null]),
  )
  if (status === NOTIFICATION_STATUSES.all) counts[category] = total
  return counts
}

export default function Notifications() {
  const {
    notifications: localNotifications,
    unreadCount,
    devDataEnabled,
    setDevDataEnabled,
    markRead,
    markAllRead,
    removeNotification,
    clearRead,
  } = useVendorNotifications()
  const markReadMutation = useMarkNotificationReadMutation()
  const markAllMutation = useMarkAllNotificationsReadMutation()
  const deleteMutation = useDeleteNotificationMutation()
  const clearMutation = useClearReadNotificationsMutation()

  const [searchParams, setSearchParams] = useSearchParams()
  const [confirmClear, setConfirmClear] = useState(false)

  const category = isValidCategory(searchParams.get('category'))
    ? searchParams.get('category')
    : NOTIFICATION_CATEGORIES.all
  const status = isValidStatus(searchParams.get('status'))
    ? searchParams.get('status')
    : NOTIFICATION_STATUSES.all
  const filterKey = `${category}:${status}`
  const [pageWindow, setPageWindow] = useState({
    filterKey,
    count: NOTIFICATION_PAGE_SIZE,
  })

  if (pageWindow.filterKey !== filterKey) {
    setPageWindow({ filterKey, count: NOTIFICATION_PAGE_SIZE })
  }

  const visibleCount = pageWindow.count
  const setVisibleCount = (count) => {
    setPageWindow((current) => ({
      ...current,
      count: typeof count === 'function' ? count(current.count) : count,
    }))
  }

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useVendorNotificationsList(
    { category, status },
    { enabled: !devDataEnabled },
  )

  const apiItems = useMemo(
    () => sortNotifications((data?.pages ?? []).flatMap((page) => page.items)),
    [data],
  )
  const apiPage = data?.pages?.[0]
  const apiTotal = apiPage?.total ?? 0

  const sortedLocal = useMemo(() => sortNotifications(localNotifications), [localNotifications])
  const localCounts = useMemo(() => countByCategory(sortedLocal), [sortedLocal])
  const localFiltered = useMemo(
    () => filterNotifications(sortedLocal, { category, status }),
    [sortedLocal, category, status],
  )

  const notifications = devDataEnabled ? localFiltered : apiItems
  const categoryCounts = useMemo(
    () => categoryCountsForView({
      devDataEnabled,
      localCounts,
      apiCounts: apiPage?.categoryCounts ?? null,
      category,
      status,
      total: apiTotal,
    }),
    [apiPage?.categoryCounts, apiTotal, category, devDataEnabled, localCounts, status],
  )

  const totalCount = devDataEnabled
    ? localNotifications.length
    : (Number.isFinite(categoryCounts[NOTIFICATION_CATEGORIES.all])
      ? categoryCounts[NOTIFICATION_CATEGORIES.all]
      : apiTotal)

  const hasActiveFilters = category !== NOTIFICATION_CATEGORIES.all || status !== NOTIFICATION_STATUSES.all
  const showInitialLoader = !devDataEnabled && isLoading
  const showListError = !devDataEnabled && isError && notifications.length === 0
  const showGlobalEmpty = devDataEnabled
    ? localNotifications.length === 0
    : !showInitialLoader && !showListError && notifications.length === 0 && !hasActiveFilters

  const categoryLabel = NOTIFICATION_CATEGORY_TABS.find((tab) => tab.id === category)?.label ?? 'Notifications'
  const scopedClear = !devDataEnabled && category !== NOTIFICATION_CATEGORIES.all
  const clearReadLabel = scopedClear ? `Clear read ${categoryLabel}` : 'Clear all read'
  const clearReadDescription = scopedClear
    ? `This removes read ${categoryLabel} notifications. Unread items in this category stay in your inbox.`
    : 'This removes every notification you have already read. Unread items stay in your inbox.'
  const canClearRead = devDataEnabled
    ? localNotifications.some((item) => item.read)
    : (status === NOTIFICATION_STATUSES.unread
      ? false
      : (category === NOTIFICATION_CATEGORIES.all && status === NOTIFICATION_STATUSES.all
        ? apiTotal > unreadCount
        : (status === NOTIFICATION_STATUSES.read ? apiTotal > 0 : notifications.some((item) => item.read))))

  useEffect(() => {
    if (!devDataEnabled && isError) {
      notify.fromError(error, 'Unable to load notifications')
    }
  }, [devDataEnabled, error, isError])

  const updateParams = (next) => {
    const params = new URLSearchParams(searchParams)
    Object.entries(next).forEach(([key, value]) => {
      if (value === NOTIFICATION_CATEGORIES.all || value === NOTIFICATION_STATUSES.all) {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })
    setSearchParams(params, { replace: true })
  }

  const handleDevDataToggle = (enabled) => {
    setDevDataEnabled(enabled)
    setVisibleCount(NOTIFICATION_PAGE_SIZE)
    notify.info(enabled ? 'Loaded dummy notification data.' : 'Showing live notifications.')
  }

  const handleMarkRead = (id, read, options = {}) => {
    if (devDataEnabled) {
      markRead(id, read)
      if (!options.silent) {
        notify.info(read ? 'Marked as read.' : 'Marked as unread.')
      }
      return
    }

    if (!read) return
    const item = notifications.find((entry) => entry.id === id)
    markReadMutation.mutate({ id, category: item?.category })
  }

  const handleMarkAllRead = () => {
    if (devDataEnabled) {
      markAllRead()
      notify.success('All notifications marked as read.')
      return
    }

    markAllMutation.mutate()
  }

  const handleDelete = (id) => {
    if (devDataEnabled) {
      removeNotification(id)
      notify.info('Notification deleted.')
      return
    }

    deleteMutation.mutate({ id })
  }

  const handleClearRead = () => {
    if (devDataEnabled) {
      clearRead()
      setConfirmClear(false)
      notify.success('Read notifications cleared.')
      return
    }

    clearMutation.mutate(
      { category },
      { onSuccess: () => setConfirmClear(false) },
    )
  }

  const errorMessage = parseApiError(error, 'Something went wrong while loading your notifications. Please try again.').message

  return (
    <DashboardLayout pageTitle="Notifications">
      <div className="page-enter space-y-6">
        <NotificationsPageHeader
          unreadCount={unreadCount}
          totalCount={totalCount}
          devDataEnabled={devDataEnabled}
          onDevDataChange={handleDevDataToggle}
          onMarkAllRead={handleMarkAllRead}
          isMarkingAll={!devDataEnabled && markAllMutation.isPending}
        />

        {showListError ? (
          <div className="mx-auto max-w-md space-y-5 rounded-2xl border border-slate-200 bg-white py-16 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-100">
              <AlertTriangle className="size-6" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-950">Unable to load notifications</h2>
              <p className="mt-2 text-sm text-slate-500">{errorMessage}</p>
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
        ) : showGlobalEmpty ? (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
            <NotificationEmptyState
              onLoadDummy={() => handleDevDataToggle(true)}
              canLoadDummy={!devDataEnabled}
            />
          </section>
        ) : showInitialLoader && !hasActiveFilters ? (
          <NotificationListSkeleton />
        ) : (
          <>
            <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:p-5">
              <NotificationCategoryTabs
                active={category}
                counts={categoryCounts}
                onChange={(next) => updateParams({ category: next })}
              />
              <NotificationStatusFilters
                active={status}
                onChange={(next) => updateParams({ status: next })}
                onClearRead={() => setConfirmClear(true)}
                canClearRead={canClearRead}
                clearLabel={clearReadLabel}
              />
            </section>

            {showInitialLoader ? (
              <NotificationListSkeleton />
            ) : (
              <NotificationList
                notifications={notifications}
                visibleCount={devDataEnabled ? visibleCount : notifications.length}
                onLoadMore={devDataEnabled
                  ? () => setVisibleCount((count) => count + NOTIFICATION_PAGE_SIZE)
                  : () => fetchNextPage()}
                onMarkRead={handleMarkRead}
                onDelete={handleDelete}
                filteredEmpty={hasActiveFilters}
                hasMore={devDataEnabled ? undefined : Boolean(hasNextPage)}
                remainingCount={devDataEnabled ? undefined : Math.max(0, apiTotal - notifications.length)}
                isLoadingMore={!devDataEnabled && isFetchingNextPage}
                allowMarkUnread={devDataEnabled}
              />
            )}
          </>
        )}
      </div>

      <ConfirmModal
        open={confirmClear}
        title="Clear read notifications?"
        description={clearReadDescription}
        confirmLabel="Clear read"
        tone="danger"
        isLoading={!devDataEnabled && clearMutation.isPending}
        loadingLabel="Clearing…"
        onConfirm={handleClearRead}
        onClose={() => {
          if (clearMutation.isPending) return
          setConfirmClear(false)
        }}
      />
    </DashboardLayout>
  )
}
