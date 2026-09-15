import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import ConfirmModal from '../../components/common/ConfirmModal'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import NotificationCategoryTabs from '../../components/notifications/NotificationCategoryTabs'
import NotificationEmptyState from '../../components/notifications/NotificationEmptyState'
import NotificationList from '../../components/notifications/NotificationList'
import NotificationsPageHeader from '../../components/notifications/NotificationsPageHeader'
import NotificationStatusFilters from '../../components/notifications/NotificationStatusFilters'
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_PAGE_SIZE,
  NOTIFICATION_STATUSES,
} from '../../constants/notifications'
import { useVendorNotifications } from '../../components/notifications/VendorNotificationsProvider'
import notify from '../../lib/notify'
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

export default function Notifications() {
  const {
    notifications,
    unreadCount,
    devDataEnabled,
    setDevDataEnabled,
    markRead,
    markAllRead,
    removeNotification,
    clearRead,
  } = useVendorNotifications()

  const [searchParams, setSearchParams] = useSearchParams()
  const [visibleCount, setVisibleCount] = useState(NOTIFICATION_PAGE_SIZE)
  const [confirmClear, setConfirmClear] = useState(false)

  const category = isValidCategory(searchParams.get('category'))
    ? searchParams.get('category')
    : NOTIFICATION_CATEGORIES.all
  const status = isValidStatus(searchParams.get('status'))
    ? searchParams.get('status')
    : NOTIFICATION_STATUSES.all

  const sorted = useMemo(() => sortNotifications(notifications), [notifications])
  const categoryCounts = useMemo(() => countByCategory(sorted), [sorted])
  const filtered = useMemo(
    () => filterNotifications(sorted, { category, status }),
    [sorted, category, status],
  )

  const hasNotifications = notifications.length > 0
  const hasRead = notifications.some((item) => item.read)
  const hasActiveFilters = category !== NOTIFICATION_CATEGORIES.all || status !== NOTIFICATION_STATUSES.all

  useEffect(() => {
    setVisibleCount(NOTIFICATION_PAGE_SIZE)
  }, [category, status])

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
    notify.info(enabled ? 'Loaded dummy notification data.' : 'Cleared notification data.')
  }

  const handleMarkRead = (id, read, options = {}) => {
    markRead(id, read)
    if (!options.silent) {
      notify.info(read ? 'Marked as read.' : 'Marked as unread.')
    }
  }

  const handleMarkAllRead = () => {
    markAllRead()
    notify.success('All notifications marked as read.')
  }

  const handleDelete = (id) => {
    removeNotification(id)
    notify.info('Notification deleted.')
  }

  const handleClearRead = () => {
    clearRead()
    setConfirmClear(false)
    notify.success('Read notifications cleared.')
  }

  return (
    <DashboardLayout pageTitle="Notifications">
      <div className="page-enter space-y-6">
        <NotificationsPageHeader
          unreadCount={unreadCount}
          totalCount={notifications.length}
          devDataEnabled={devDataEnabled}
          onDevDataChange={handleDevDataToggle}
          onMarkAllRead={handleMarkAllRead}
        />

        {!hasNotifications ? (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
            <NotificationEmptyState
              onLoadDummy={() => handleDevDataToggle(true)}
              canLoadDummy={!devDataEnabled}
            />
          </section>
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
                canClearRead={hasRead}
              />
            </section>

            <NotificationList
              notifications={filtered}
              visibleCount={visibleCount}
              onLoadMore={() => setVisibleCount((count) => count + NOTIFICATION_PAGE_SIZE)}
              onMarkRead={handleMarkRead}
              onDelete={handleDelete}
              filteredEmpty={hasActiveFilters}
            />
          </>
        )}
      </div>

      <ConfirmModal
        open={confirmClear}
        title="Clear read notifications?"
        description="This removes every notification you have already read. Unread items stay in your inbox."
        confirmLabel="Clear read"
        tone="danger"
        onConfirm={handleClearRead}
        onClose={() => setConfirmClear(false)}
      />
    </DashboardLayout>
  )
}
