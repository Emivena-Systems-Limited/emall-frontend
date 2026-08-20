import { useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Eye, MoreHorizontal, Printer, ShoppingBag } from 'lucide-react'
import PortalMenu from '../common/PortalMenu'
import { getCustomerOrdersRoute } from '../../constants/customers'

function CustomerMenuAction({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
    >
      <Icon className="size-4 shrink-0 text-slate-500" strokeWidth={2} />
      {label}
    </button>
  )
}

export default function CustomerRowActions({
  customer,
  onPrint,
  hideViewDetails = false,
  align = 'end',
  className = '',
  orderFilters,
}) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)

  const close = () => setOpen(false)

  const run = (action) => {
    action()
    close()
  }

  return (
    <div className={`flex ${align === 'end' ? 'justify-end' : 'justify-start'} ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        title="Customer actions"
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
        menuWidth={260}
        className="overflow-hidden py-0 shadow-[0_16px_40px_rgba(15,23,42,0.12)]"
      >
        <div className="border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Customer actions
          </p>
          <p className="mt-1 truncate text-sm font-bold text-slate-950">{customer.name}</p>
        </div>

        <div className="py-1">
          {!hideViewDetails && (
            <CustomerMenuAction
              icon={Eye}
              label="View details"
              onClick={() => run(() => navigate(`/customers/${customer.id}`))}
            />
          )}
          <CustomerMenuAction
            icon={ShoppingBag}
            label="View orders"
            onClick={() => run(() => navigate(getCustomerOrdersRoute(customer.id, orderFilters)))}
          />
          <CustomerMenuAction
            icon={Printer}
            label="Print"
            onClick={() => run(() => onPrint(customer))}
          />
        </div>
      </PortalMenu>
    </div>
  )
}
