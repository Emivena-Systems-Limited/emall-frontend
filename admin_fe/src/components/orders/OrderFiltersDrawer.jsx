import { CreditCard, RotateCcw, SlidersHorizontal, Store, Truck, UserRound } from 'lucide-react'
import { formatCount } from '../../utils/formatters'
import { countOrderDrawerFilters } from '../../utils/orderFilters'
import {
  ORDER_DELIVERY_OPTIONS,
  ORDER_PAYMENT_OPTIONS,
} from '../../constants/adminOrders'
import SlideDrawer from '../vendors/SlideDrawer'

function FilterCard({ icon: Icon, title, description, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
            <Icon className="size-4" strokeWidth={2} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            <p className="mt-0.5 text-xs text-slate-500">{description}</p>
          </div>
        </div>
      </div>
      <div className="p-4">{children}</div>
    </section>
  )
}

function FilterSelect({ id, label, value, onChange, children }) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand-light"
      >
        {children}
      </select>
    </label>
  )
}

export default function OrderFiltersDrawer({
  open,
  onClose,
  paymentStatus,
  deliveryStatus,
  vendorId,
  userId,
  vendorOptions = [],
  userOptions = [],
  onPaymentChange,
  onDeliveryChange,
  onVendorChange,
  onUserChange,
  onClear,
  resultCount = 0,
}) {
  const activeCount = countOrderDrawerFilters({ paymentStatus, deliveryStatus, vendorId, userId })

  return (
    <SlideDrawer
      open={open}
      onClose={onClose}
      labelledBy="order-filters-title"
      title="Filter orders"
      subtitle={
        activeCount > 0
          ? `${activeCount} filter${activeCount === 1 ? '' : 's'} applied`
          : 'Narrow the list by payment, delivery, store, or shopper'
      }
      icon={SlidersHorizontal}
      footer={(
        <>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              <RotateCcw className="size-4" />
              Clear filters
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-full cursor-pointer rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            Show {formatCount(resultCount)} order{resultCount === 1 ? '' : 's'}
          </button>
        </>
      )}
    >
      <div className="space-y-4">
        <FilterCard icon={CreditCard} title="Payment" description="What the shopper paid, or still owes">
          <FilterSelect
            id="order-payment"
            label="Payment status"
            value={paymentStatus}
            onChange={onPaymentChange}
          >
            {ORDER_PAYMENT_OPTIONS.map((option) => (
              <option key={option.key} value={option.key}>{option.label}</option>
            ))}
          </FilterSelect>
        </FilterCard>

        <FilterCard icon={Truck} title="Delivery" description="Where fulfilment stands right now">
          <FilterSelect
            id="order-delivery"
            label="Delivery status"
            value={deliveryStatus}
            onChange={onDeliveryChange}
          >
            {ORDER_DELIVERY_OPTIONS.map((option) => (
              <option key={option.key} value={option.key}>{option.label}</option>
            ))}
          </FilterSelect>
        </FilterCard>

        <FilterCard icon={Store} title="Store" description="Vendors on the current result set">
          <FilterSelect
            id="order-vendor"
            label="Store"
            value={vendorId}
            onChange={onVendorChange}
          >
            <option value="">Any store</option>
            {vendorOptions.map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </FilterSelect>
        </FilterCard>

        <FilterCard icon={UserRound} title="Shopper" description="Customers on the current result set">
          <FilterSelect
            id="order-user"
            label="Shopper"
            value={userId}
            onChange={onUserChange}
          >
            <option value="">Any shopper</option>
            {userOptions.map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </FilterSelect>
        </FilterCard>
      </div>
    </SlideDrawer>
  )
}
