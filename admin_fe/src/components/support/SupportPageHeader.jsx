export default function SupportPageHeader({ summary }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-950">Customer tickets</h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-500">
        Requests shoppers submit from Help & Support land here with a topic, an optional order number, and their message.
      </p>
      {summary.totalConversations > 0 && (
        <p className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
          {summary.unreadMessages > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-brand ring-1 ring-brand/20">
              {summary.unreadMessages} awaiting you
            </span>
          )}
          <span>{summary.openCount} open request{summary.openCount === 1 ? '' : 's'}</span>
        </p>
      )}
    </div>
  )
}
