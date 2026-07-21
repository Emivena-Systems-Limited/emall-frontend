import DevDataToggle from '../dev/DevDataToggle'

export default function MessagesPageHeader({
  summary,
  devDataEnabled,
  onDevDataChange,
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Messages</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage customer conversations about orders, products, and general inquiries.
        </p>
        {summary.totalConversations > 0 && (
          <p className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
            {summary.unreadMessages > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-brand ring-1 ring-brand/20">
                {summary.unreadMessages} unread
              </span>
            )}
            <span>{summary.openCount} active conversation{summary.openCount === 1 ? '' : 's'}</span>
          </p>
        )}
      </div>

      <DevDataToggle
        enabled={devDataEnabled}
        onChange={onDevDataChange}
        count={summary.totalConversations}
        ariaLabel="Toggle dummy message data"
      />
    </div>
  )
}
