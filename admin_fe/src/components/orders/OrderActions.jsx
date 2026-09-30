import { useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { Ban, CreditCard, Eye, MoreHorizontal, RotateCcw, Store, Truck, UserRound } from 'lucide-react'
import PortalMenu from '../common/PortalMenu'
import { getOrderApiId } from '../../utils/normalizeAdminOrders'
import { getOrderMenuState, orderPaymentPath } from '../../utils/orderActions'
import { buildNavigationState } from '../../utils/smartNavigation'
import OrderCancelModal from './OrderCancelModal'
import OrderCustomerDeliveryDrawer from './OrderCustomerDeliveryDrawer'

const menuItemClass = 'flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950'
const dangerItemClass = 'flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50'

function MenuAction({ icon: Icon, label, onClick, danger = false }) {
  return (
    <button type="button" role="menuitem" onClick={onClick} className={danger ? dangerItemClass : menuItemClass}>
      <Icon className="size-4 shrink-0" strokeWidth={2} />
      {label}
    </button>
  )
}

export default function OrderActions({ order }) {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useSelector((state) => state.auth.user)
  const [open, setOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [shipmentOpen, setShipmentOpen] = useState(false)
  const triggerRef = useRef(null)
  const name = order.orderNumber || 'this order'
  const actions = getOrderMenuState(order, user)
  const apiId = getOrderApiId(order)

  const go = (path) => {
    setOpen(false)
    navigate(path, {
      state: buildNavigationState(location, { returnLabel: 'Back to orders' }),
    })
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${name}`}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          setOpen((value) => !value)
        }}
        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <MoreHorizontal className="size-4" strokeWidth={2} aria-hidden="true" />
      </button>

      <PortalMenu
        open={open}
        onClose={() => setOpen(false)}
        triggerRef={triggerRef}
        menuWidth={240}
      >
        {actions.viewOrder ? (
          <MenuAction icon={Eye} label="View order details" onClick={() => go(`/orders/${encodeURIComponent(apiId)}`)} />
        ) : null}
        {actions.viewCustomer ? (
          <MenuAction icon={UserRound} label="View customer" onClick={() => go(`/users/${encodeURIComponent(order.userId)}`)} />
        ) : null}
        {actions.viewVendor ? (
          <MenuAction icon={Store} label="View vendor/store" onClick={() => go(`/vendors/${encodeURIComponent(order.vendorId)}`)} />
        ) : null}
        {actions.viewPayment ? (
          <MenuAction icon={CreditCard} label="View payment details" onClick={() => go(orderPaymentPath(order))} />
        ) : null}
        {actions.viewShipment ? (
          <MenuAction
            icon={Truck}
            label="View shipment/tracking"
            onClick={() => {
              setOpen(false)
              setShipmentOpen(true)
            }}
          />
        ) : null}
        {actions.viewRefund ? (
          <MenuAction icon={RotateCcw} label="View refund/return" onClick={() => go(orderPaymentPath(order))} />
        ) : null}
        {actions.cancelOrder ? (
          <>
            <div className="my-1 border-t border-slate-100" role="separator" />
            <MenuAction
              icon={Ban}
              label="Cancel order"
              danger
              onClick={() => {
                setOpen(false)
                setCancelOpen(true)
              }}
            />
          </>
        ) : null}
      </PortalMenu>

      <OrderCancelModal
        open={cancelOpen}
        order={order}
        onClose={() => setCancelOpen(false)}
      />
      <OrderCustomerDeliveryDrawer
        open={shipmentOpen}
        order={order}
        onClose={() => setShipmentOpen(false)}
      />
    </>
  )
}
