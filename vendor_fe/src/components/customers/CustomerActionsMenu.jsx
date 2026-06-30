import { useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Eye, MoreHorizontal, Printer } from 'lucide-react'
import PortalMenu from '../common/PortalMenu'

function CustomerMenuAction({ icon: Icon, tone, label, helper, onClick }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="group flex w-full cursor-pointer items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
    >
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform group-hover:scale-[1.03] ${tone}`}
      >
        <Icon className="size-4" strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1 pt-0.5">
        <span className="block text-sm font-semibold text-slate-900">{label}</span>
        <span className="mt-0.5 block text-xs leading-snug text-slate-500">{helper}</span>
      </span>
    </button>
  )
}

export default function CustomerActionsMenu({ customer, onPrint, hideViewDetails = false }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)

  const close = () => setOpen(false)

  const run = (action) => {
    action()
    close()
  }

  return (
    <div className="flex justify-end">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`inline-flex cursor-pointer items-center justify-center rounded-lg p-2 ring-1 transition-all ${
          open
            ? 'bg-brand-light/30 text-brand ring-brand/25 shadow-sm'
            : 'text-slate-500 ring-transparent hover:bg-slate-100 hover:text-slate-800'
        }`}
        aria-label={`Actions for ${customer.name}`}
      >
        <MoreHorizontal className="size-4" />
      </button>

      <PortalMenu
        open={open}
        onClose={close}
        triggerRef={triggerRef}
        menuWidth={300}
        className="overflow-hidden py-0 shadow-[0_20px_50px_rgba(15,23,42,0.14)]"
      >
        <div className="border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white px-4 py-3.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Customer actions
          </p>
          <p className="mt-1 text-sm font-bold text-slate-950">{customer.name}</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            View profile details or print a customer summary.
          </p>
        </div>

        <div className="py-1.5">
          {!hideViewDetails && (
            <CustomerMenuAction
              icon={Eye}
              tone="bg-cyan-50 text-cyan-700 ring-cyan-100"
              label="View Details"
              helper="See contact info, order history, and reviews."
              onClick={() => run(() => navigate(`/customers/${customer.id}`))}
            />
          )}
          <CustomerMenuAction
            icon={Printer}
            tone="bg-slate-100 text-slate-700 ring-slate-200"
            label="Print"
            helper="Generate a printable customer profile and order summary."
            onClick={() => run(() => onPrint(customer))}
          />
        </div>
      </PortalMenu>
    </div>
  )
}
