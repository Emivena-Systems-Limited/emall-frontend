import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'

export default function ViewAllLink({ to, children = 'View All' }) {
  return (
    <Link
      to={to}
      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-800 shadow-sm transition duration-200 hover:border-auth-primary/40 hover:bg-auth-primary/5 hover:text-auth-primary sm:h-10 sm:px-4"
    >
      {children}
      <ArrowRight className="size-3.5 sm:size-4" strokeWidth={2.25} aria-hidden />
    </Link>
  )
}
