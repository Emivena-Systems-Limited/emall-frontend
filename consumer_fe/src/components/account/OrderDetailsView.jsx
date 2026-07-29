import { Link } from 'react-router'
import { ChevronRight, Download, Minus, Package, Plus, Star } from 'lucide-react'
import { formatCediPriceParts } from '../../utils/formatCurrency'
import {
  canCancelOrder,
  formatEstimatedDelivery,
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
import OrderManagePanel from './OrderManagePanel'
import OrderTrackingTimeline from './OrderTrackingTimeline'

const tableColumns =
  'sm:grid-cols-[minmax(0,1fr)_minmax(5.5rem,7rem)_minmax(5.5rem,6.5rem)_minmax(5.5rem,7rem)] sm:gap-x-6'

const tableCellPadding = 'px-3 sm:px-4'

function OrderTablePrice({ amountGhs, compareAmountGhs, align = 'center' }) {
  const priceParts = formatCediPriceParts(amountGhs)
  const compareParts = compareAmountGhs != null ? formatCediPriceParts(compareAmountGhs) : null
  const alignClass = align === 'right' ? 'items-end text-right' : 'items-center text-center'
  const rowAlignClass = align === 'right' ? 'justify-end' : 'justify-center'

  return (
    <div className={`flex flex-col gap-0.5 ${alignClass}`}>
      <span className={`inline-flex items-baseline leading-none text-slate-950 ${rowAlignClass}`}>
        <span className="mr-0.5 self-start text-[0.625rem] font-normal leading-none">{priceParts.currency}</span>
        <span className="text-base font-bold tabular-nums">{priceParts.whole}</span>
        <span className="relative -top-1 text-[0.625rem] font-bold tabular-nums leading-none">
          .{priceParts.fraction}
        </span>
      </span>
      {compareParts ? (
        <span
          className={`inline-flex items-baseline leading-none text-slate-400 line-through ${rowAlignClass}`}
          aria-label={`Regular price ${compareParts.currency}${compareParts.whole}.${compareParts.fraction}`}
        >
          <span className="mr-0.5 self-start text-[0.5625rem] font-normal leading-none">{compareParts.currency}</span>
          <span className="text-[0.6875rem] font-medium tabular-nums">{compareParts.whole}</span>
          <span className="relative -top-0.5 text-[0.5625rem] font-medium tabular-nums leading-none">
            .{compareParts.fraction}
          </span>
        </span>
      ) : null}
    </div>
  )
}

function OrderDetailsTableRow({ item, orderId, deliveryIsFree }) {
  const image = resolveOrderItemImage(item)
  const variantLabel = resolveOrderItemVariantLabel(item)
  const storeName = resolveOrderItemStoreName(item)
  const reviewCount = resolveOrderItemVendorReviewCount(item)
  const productHref = resolveOrderItemProductHref(item)
  const productName = item.product_name ?? item.name ?? 'Product'
  const { unitPrice, comparePrice, lineTotal, compareLineTotal } = resolveOrderItemPricing(item)
  const reviewHref = `/account/reviews/new?product=${encodeURIComponent(productName)}&order=${encodeURIComponent(orderId)}`

  return (
    <article className={`grid grid-cols-1 gap-3 border-b border-slate-200 py-5 last:border-b-0 sm:items-center ${tableColumns}`}>
      <div className={`flex min-w-0 items-center gap-3 ${tableCellPadding}`}>
        <input
          type="checkbox"
          aria-label={`Select ${productName}`}
          className="size-4 shrink-0 rounded-sm border-slate-300 accent-auth-primary"
        />
        {image ? (
          <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            <img src={image} alt="" className="size-full object-contain p-1" />
          </span>
        ) : (
          <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100 text-slate-400">
            <Package className="size-6" strokeWidth={1.8} aria-hidden />
          </span>
        )}
        <div className="min-w-0 flex-1 space-y-1.5">
          <Link to={productHref} className="text-sm font-bold text-slate-950 transition hover:text-auth-primary">
            {productName}
          </Link>
          {variantLabel ? (
            <p className="text-xs leading-snug text-slate-500">{variantLabel}</p>
          ) : null}
          {deliveryIsFree ? (
            <span className="inline-flex rounded-sm bg-[#edf7ed] px-2 py-0.5 text-[0.6875rem] font-medium text-[#2e7d32]">
              Free Delivery
            </span>
          ) : null}
          {storeName ? (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
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
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 pt-0.5 text-xs text-slate-900">
            <Link to={productHref} className="underline underline-offset-2 hover:text-auth-primary">
              Buy Again
            </Link>
            <Link to="/account/returns" className="underline underline-offset-2 hover:text-auth-primary">
              Return Item
            </Link>
            <Link to={reviewHref} className="underline underline-offset-2 hover:text-auth-primary">
              Leave Review
            </Link>
          </div>
        </div>
      </div>

      <div className={`flex items-center justify-between sm:justify-center ${tableCellPadding}`}>
        <span className="text-xs font-semibold text-slate-500 sm:hidden">Price</span>
        <OrderTablePrice amountGhs={unitPrice} compareAmountGhs={comparePrice} />
      </div>

      <div className={`flex items-center justify-between sm:justify-center ${tableCellPadding}`}>
        <span className="text-xs font-semibold text-slate-500 sm:hidden">Quantity</span>
        <div className="inline-flex items-center gap-3 rounded-full bg-slate-100 px-3 py-1.5">
          <Minus className="size-3.5 text-slate-500" aria-hidden />
          <span className="min-w-4 text-center text-sm font-bold tabular-nums text-auth-primary">{Math.max(1, Number(item.quantity) || 1)}</span>
          <Plus className="size-3.5 text-auth-primary" aria-hidden />
        </div>
      </div>

      <div className={`flex items-center justify-between sm:justify-end ${tableCellPadding}`}>
        <span className="text-xs font-semibold text-slate-500 sm:hidden">Subtotal</span>
        <OrderTablePrice amountGhs={lineTotal} compareAmountGhs={compareLineTotal} align="right" />
      </div>
    </article>
  )
}

export default function OrderDetailsView({ order, onCancelRequest }) {
  const raw = order.raw ?? {}
  const items = Array.isArray(raw.items) ? raw.items : []
  const totals = getOrderTotals(raw)
  const estimatedDelivery = formatEstimatedDelivery(raw)
  const deliveryIsFree = totals.deliveryFee <= 0
  const cancellable = canCancelOrder(raw)
  const orderNumber = formatOrderNumber(order.id, { withHash: true })

  const handleDownloadInvoice = () => {
    notify.info('Invoice download will be available soon.')
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
          <h1 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
            Order{' '}
            <span className="tabular-nums tracking-normal">{orderNumber}</span>
          </h1>
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
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-auth-primary px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-auth-primary-hover sm:text-sm"
          >
            <Download className="size-4" aria-hidden />
            Download Invoice
          </button>
          {cancellable ? (
            <button
              type="button"
              onClick={() => onCancelRequest(order)}
              className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200 sm:text-sm"
            >
              Cancel Request
            </button>
          ) : null}
        </div>
      </header>

      <OrderTrackingTimeline record={raw} variant="status" compact />

      <section className="w-full pt-1">
        <div className={`hidden bg-auth-primary py-3 text-sm font-bold text-white sm:grid sm:items-center ${tableColumns}`}>
          <span className={tableCellPadding}>Product</span>
          <span className={`text-center ${tableCellPadding}`}>Price</span>
          <span className={`text-center ${tableCellPadding}`}>Quantity</span>
          <span className={`text-right ${tableCellPadding}`}>Subtotal</span>
        </div>

        {items.length ? (
          <div>
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
      </section>

      <OrderManagePanel order={order} onCancelRequest={onCancelRequest} compact />
    </section>
  )
}
