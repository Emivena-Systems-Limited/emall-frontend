export default function DashboardReveal({ index = 0, children, className = '' }) {
  return (
    <div
      className={`dashboard-reveal ${className}`.trim()}
      style={{ animationDelay: `${index * 65}ms` }}
    >
      {children}
    </div>
  )
}
