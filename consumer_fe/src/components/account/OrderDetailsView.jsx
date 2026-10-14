import { Link, useNavigate } from 'react-router'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { ChevronRight, Download, Loader2, Package, RotateCcw, ShoppingCart, Star } from 'lucide-react'
import {
  buildBuyAgainCartArgs,
  canReturnOrderItem,
  canReviewOrderItem,
  extractOrderItems,
  formatDeliveryStatus,
  formatEstimatedDelivery,
  formatOrderMoney,
  formatOrderNumber,
  getOrderTotals,
  resolveOrderItemImage,
  resolveOrderItemPricing,
  resolveOrderItemProductHref,
  resolveOrderItemStoreName,
  resolveOrderItemVariantLabel,
  resolveOrderItemVendorReviewCount,
} from '../../utils/normalizeOrders'
import { notify } from '../../lib/notify'
import { downloadOrderInvoice } from '../../utils/downloadOrderInvoice'
import { buildLeaveReviewLink } from '../../utils/reviewRouteState'
import { useCartActions } from '../../hooks/useCartActions'
import { hasBackendProductId } from '../../utils/normalizeCart'
import OrderManagePanel from './OrderManagePanel'
import OrderTrackingTimeline from './OrderTrackingTimeline'
import CatalogLineItemCard from '../shared/CatalogLineItemCard'

const itemDeliveryStatusStyles = {
  'Pending Delivery': 'bg-amber-50 text-amber-700',
  Processing: 'bg-sky-50 text-sky-700',
  Shipped: 'bg-violet-50 text-violet-700',
  'Partially Shipped': 'bg-violet-50 text-violet-700',
  Delivered: 'bg-emerald-50 text-emerald-700',
  'Partially Delivered': 'bg-teal-50 text-teal-700',
  Cancelled: 'bg-red-50 text-red-600',
  Refunded: 'bg-slate-100 text-slate-700',
}

const paymentStatusStyles = {
  Paid: 'bg-emerald-50 text-emerald-700',
  'Payment pending': 'bg-amber-50 text-amber-700',
  'Payment failed': 'bg-red-50 text-red-600',
  Refunded: 'bg-slate-100 text-slate-700',
  Cancelled: 'bg-red-50 text-red-600',
}

function ItemDeliveryBadge({ status }) {
  const label = formatDeliveryStatus(status)
  const style = itemDeliveryStatusStyles[label] ?? 'bg-slate-100 text-slate-600'

  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[0.625rem] font-bold ${style}`}>
      {label}
    </span>
  )
}

function OrderDetailsTableRow({ item, orderId, deliveryIsFree }) {
  const navigate = useNavigate()
  const { addToCart } = useCartActions()
  const [isBuyingAgain, setIsBuyingAgain] = useState(false)
  const image = resolveOrderItemImage(item)
  const variantLabel = resolveOrderItemVariantLabel(item)
  const storeName = resolveOrderItemStoreName(item)
  const reviewCount = resolveOrderItemVendorReviewCount(item)
  const productHref = resolveOrderItemProductHref(item) || '/'
  const productName = item.product_name ?? item.name ?? 'Product'
  const { unitPrice, comparePrice } = resolveOrderItemPricing(item)
  const canReview = canReviewOrderItem(item)
  const canReturn = canReturnOrderItem(item)
  const reviewLink = buildLeaveReviewLink({ item, orderId })
  const returnHref = `/account/returns?product=${encodeURIComponent(productName)}&order=${encodeURIComponent(orderId)}${item.id ? `&item=${encodeURIComponent(item.id)}` : ''}`

  const handleBuyAgain = async () => {
    if (isBuyingAgain) return

    const cartArgs = buildBuyAgainCartArgs(item)
    const productId = cartArgs?.options?.productId ?? cartArgs?.product?.backendId

    if (!cartArgs || !hasBackendProductId(productId)) {
      notify.error('This product cannot be added to cart yet.')
      return
    }

    setIsBuyingAgain(true)
    try {
      const added = await addToCart(cartArgs.product, cartArgs.options)
      if (added) {
        navigate('/cart')
      }
    } finally {
      setIsBuyingAgain(false)
    }
  }

  const quantity = Math.max(1, Number(item.quantity) || 1)
  const actions = [
    {
      id: 'buy-again',
      label: isBuyingAgain ? 'Adding…' : 'Buy Again',
      icon: ShoppingCart,
      onClick: handleBuyAgain,
      disabled: isBuyingAgain,
    },
  ]
  if (canReturn) {
    actions.push({ id: 'return', label: 'Return Item', icon: RotateCcw, to: returnHref })
  }
  if (canReview) {
    actions.push({
      id: 'review',
      label: 'Leave Review',
      icon: Star,
      to: reviewLink.to,
      state: reviewLink.state,
    })
  }

  return (
    <CatalogLineItemCard
      name={productName}
      href={productHref}
      image={image}
      imageFallback={<Package className="size-8" strokeWidth={1.8} aria-hidden />}
      optionLabel={variantLabel || undefined}
      freeShipping={deliveryIsFree}
      quantity={quantity}
      readOnlyQuantity
      unitPrice={unitPrice}
      lineTotal={unitPrice * quantity}
      comparePrice={comparePrice}
      badges={(
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <ItemDeliveryBadge status={item.delivery_status} />
        </div>
      )}
      meta={storeName ? (
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="font-semibold text-auth-primary">{storeName}</span>
          <span className="flex items-center text-auth-primary">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} className="size-2.5 fill-current" aria-hidden />
            ))}
          </span>
          {reviewCount != null ? (
            <span className="text-slate-500">({reviewCount})</span>
          ) : null}
        </div>
      ) : null}
      actions={actions}
    />
  )
}

export default function OrderDetailsView({ order, onCancelRequest }) {
  const user = useSelector((state) => state.auth.user)
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false)
  const raw = order.raw ?? {}
  const items = extractOrderItems(raw)
  const totals = getOrderTotals(raw)
  const estimatedDelivery = formatEstimatedDelivery(raw)
  const deliveryIsFree = totals.deliveryFee <= 0
  const orderNumber = formatOrderNumber(order.id, { withHash: true })
  const fulfillmentSummary = order.fulfillment?.summary
  const paymentStatus = order.paymentStatus
  const paymentStyle = paymentStatusStyles[paymentStatus] ?? 'bg-slate-100 text-slate-600'

  const handleDownloadInvoice = async () => {
    if (isDownloadingInvoice) return
    setIsDownloadingInvoice(true)
    try {
      await downloadOrderInvoice(order, { customer: user })
      notify.success('Invoice downloaded')
    } catch (error) {
      notify.fromError(error, 'Unable to download invoice')
    } finally {
      setIsDownloadingInvoice(false)
    }
  }

  return (
    <section className="w-full space-y-5 px-4 pb-2 sm:px-6">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
        <Link to="/" className="transition hover:text-auth-primary">
          Home
        </Link>
        <ChevronRight className="size-3 shrink-0" />
        <Link to="/account/orders" className="font-medium text-slate-700 transition hover:text-auth-primary">
          Orders
        </Link>
        <ChevronRight className="size-3 shrink-0" />
        <span className="font-semibold tabular-nums text-slate-900">{orderNumber}</span>
      </nav>

      <header className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-lg font-bold tracking-tight text-slate-950 sm:text-xl">
            Order{' '}
            <span className="tabular-nums tracking-normal">{orderNumber}</span>
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {order.deliveryStatus ? (
              <span className={`rounded-full px-2.5 py-1 text-[0.68rem] font-bold ${itemDeliveryStatusStyles[order.deliveryStatus] ?? 'bg-slate-100 text-slate-600'}`}>
                {order.deliveryStatus}
              </span>
            ) : null}
            {paymentStatus ? (
              <span className={`rounded-full px-2.5 py-1 text-[0.68rem] font-bold ${paymentStyle}`}>
                {paymentStatus}
              </span>
            ) : null}
            {fulfillmentSummary ? (
              <span className="text-xs font-medium text-slate-500">{fulfillmentSummary}</span>
            ) : null}
          </div>
          <p className="mt-1.5 text-sm text-slate-600">
            {estimatedDelivery === 'Delivered' ? (
              <span className="font-bold text-emerald-700">Delivered</span>
            ) : estimatedDelivery ? (
              <>
                <span className="text-slate-500">Estimated Delivery: </span>
                <span className="font-bold text-slate-950">{estimatedDelivery}</span>
              </>
            ) : (
              <>
                <span className="text-slate-500">Placed: </span>
                <span className="font-bold text-slate-950">{order.date}</span>
              </>
            )}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2.5 sm:justify-end">
          <button
            type="button"
            onClick={handleDownloadInvoice}
            disabled={isDownloadingInvoice}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-auth-primary px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-auth-primary-hover disabled:cursor-wait disabled:opacity-70 sm:text-sm"
          >
            {isDownloadingInvoice ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Download className="size-4" aria-hidden />
            )}
            {isDownloadingInvoice ? 'Preparing invoice…' : 'Download Invoice'}
          </button>
        </div>
      </header>

      <OrderTrackingTimeline record={raw} variant="status" compact />

      <section className="w-full pt-1">
        {items.length ? (
          <div className="space-y-3 sm:space-y-4">
            {items.map((item) => (
              <OrderDetailsTableRow
                key={item.id ?? `${item.product_id}-${item.sku}`}
                item={item}
                orderId={order.id}
                deliveryIsFree={deliveryIsFree}
              />
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-sm text-slate-500">
            Item details for this order are not available yet.
          </div>
        )}

        <dl className="mt-4 space-y-2 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm sm:px-5">
          <div className="flex items-center justify-between">
            <dt className="text-slate-600">Subtotal</dt>
            <dd className="font-semibold text-slate-900">{formatOrderMoney(totals.subtotal)}</dd>
          </div>
          {totals.discountTotal > 0 ? (
            <div className="flex items-center justify-between text-auth-primary">
              <dt>Discount</dt>
              <dd className="font-semibold">-{formatOrderMoney(totals.discountTotal)}</dd>
            </div>
          ) : null}
          <div className="flex items-center justify-between">
            <dt className="text-slate-600">Delivery</dt>
            <dd className="font-semibold text-slate-900">
              {deliveryIsFree ? 'Free' : formatOrderMoney(totals.deliveryFee)}
            </dd>
          </div>
          {totals.taxTotal > 0 ? (
            <div className="flex items-center justify-between">
              <dt className="text-slate-600">Tax</dt>
              <dd className="font-semibold text-slate-900">{formatOrderMoney(totals.taxTotal)}</dd>
            </div>
          ) : null}
          <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base">
            <dt className="font-bold text-slate-950">Total Paid</dt>
            <dd className="font-extrabold text-slate-950">{formatOrderMoney(totals.grandTotal)}</dd>
          </div>
        </dl>
      </section>

      <OrderManagePanel order={order} onCancelRequest={onCancelRequest} compact />
    </section>
  )
}
