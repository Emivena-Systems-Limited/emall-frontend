import { jsPDF } from 'jspdf'
import {
  extractOrderItems,
  formatOrderAddress,
  formatOrderNumber,
  getOrderTotals,
  resolveOrderItemPricing,
  resolveOrderItemVariantLabel,
} from './normalizeOrders'

const BRAND = '#C73B2D'
const INK = '#0F172A'
const MUTED = '#64748B'
const RULE = '#E2E8F0'
const MARGIN = 16
const PAGE_WIDTH = 210
const PAGE_HEIGHT = 297
const CONTENT_RIGHT = PAGE_WIDTH - MARGIN

function money(value) {
  const amount = Number(value || 0)
  return `GHS ${amount.toFixed(2)}`
}

function asLines(value) {
  return String(value ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function customerName(user) {
  const fromUser = [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim()
  return fromUser || user?.name || user?.full_name || user?.email || ''
}

function buildInvoiceFilename(orderNumber) {
  const safe = String(orderNumber ?? 'order')
    .replace(/^#/, '')
    .trim()
    .replace(/[^\w-]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `EZ-Mall-Invoice-${safe || 'order'}.pdf`
}

function drawWrapped(pdf, text, x, y, maxWidth, lineHeight = 4.4) {
  const lines = pdf.splitTextToSize(String(text ?? ''), maxWidth)
  pdf.text(lines, x, y)
  return y + lines.length * lineHeight
}

/**
 * Builds and downloads a PDF invoice from the order already loaded in account.
 * Line items, addresses, payment status, and totals all come from GET /orders.
 */
export async function downloadOrderInvoice(order, { customer } = {}) {
  const record = order?.raw ?? order ?? {}
  const items = extractOrderItems(record)
  const totals = getOrderTotals(record)
  const orderNumber = formatOrderNumber(order?.id ?? record.order_number ?? record.id, { withHash: true })
  const placedOn = order?.date || 'Date unavailable'
  const paymentStatus = order?.paymentStatus || ''
  const deliveryStatus = order?.deliveryStatus || ''
  const billing = formatOrderAddress(record.billing_address ?? record.billing)
  const shipping = formatOrderAddress(record.shipping_address ?? record.shipping)
  const billToName = customerName(customer)
    || asLines(billing)[0]
    || asLines(shipping)[0]
    || 'Customer'

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  pdf.setLineHeightFactor(1.25)

  let y = 18

  const ensureSpace = (needed) => {
    if (y + needed <= PAGE_HEIGHT - 18) return
    pdf.addPage()
    y = 18
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9)
    pdf.setTextColor(BRAND)
    pdf.text('EZ-Mall', MARGIN, y)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(MUTED)
    pdf.text(`${orderNumber}  ·  continued`, CONTENT_RIGHT, y, { align: 'right' })
    y += 8
  }

  pdf.setFillColor(199, 59, 45)
  pdf.rect(0, 0, PAGE_WIDTH, 3.2, 'F')

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(18)
  pdf.setTextColor(BRAND)
  pdf.text('EZ-Mall', MARGIN, y)

  pdf.setFontSize(16)
  pdf.setTextColor(INK)
  pdf.text('INVOICE', CONTENT_RIGHT, y, { align: 'right' })
  y += 7

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8.5)
  pdf.setTextColor(MUTED)
  pdf.text('Shop for your favorite products', MARGIN, y)
  pdf.setTextColor(INK)
  pdf.setFont('helvetica', 'bold')
  pdf.text(orderNumber, CONTENT_RIGHT, y, { align: 'right' })
  y += 10

  pdf.setDrawColor(RULE)
  pdf.setLineWidth(0.3)
  pdf.line(MARGIN, y, CONTENT_RIGHT, y)
  y += 8

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(7.5)
  pdf.setTextColor(MUTED)
  pdf.text('ISSUED', MARGIN, y)
  pdf.text('PAYMENT', 72, y)
  pdf.text('DELIVERY', 128, y)
  y += 5
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(10)
  pdf.setTextColor(INK)
  pdf.text(String(placedOn), MARGIN, y)
  pdf.text(paymentStatus || '—', 72, y)
  pdf.text(deliveryStatus || '—', 128, y)
  y += 12

  const colWidth = (CONTENT_RIGHT - MARGIN - 8) / 2
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(7.5)
  pdf.setTextColor(MUTED)
  pdf.text('BILL TO', MARGIN, y)
  pdf.text('SHIP TO', MARGIN + colWidth + 8, y)
  y += 5

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(10)
  pdf.setTextColor(INK)
  const billStart = y
  y = drawWrapped(pdf, billToName, MARGIN, y, colWidth, 4.6)

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8.5)
  pdf.setTextColor(MUTED)
  const billingLines = asLines(billing).filter((line) => line !== billToName)
  const shippingLines = asLines(shipping)
  billingLines.forEach((line) => {
    y = drawWrapped(pdf, line, MARGIN, y, colWidth, 4.2)
  })
  const billEnd = y

  let shipY = billStart
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8.5)
  pdf.setTextColor(MUTED)
  if (shippingLines.length) {
    shippingLines.forEach((line) => {
      const next = pdf.splitTextToSize(line, colWidth)
      pdf.text(next, MARGIN + colWidth + 8, shipY)
      shipY += next.length * 4.2
    })
  } else {
    pdf.text('Same as billing', MARGIN + colWidth + 8, shipY)
    shipY += 4.2
  }

  y = Math.max(billEnd, shipY) + 10

  ensureSpace(18)
  pdf.setFillColor(15, 23, 42)
  pdf.roundedRect(MARGIN, y, CONTENT_RIGHT - MARGIN, 8, 1.2, 1.2, 'F')
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(7.5)
  pdf.setTextColor('#FFFFFF')
  pdf.text('ITEM', MARGIN + 3, y + 5.3)
  pdf.text('QTY', 138, y + 5.3, { align: 'right' })
  pdf.text('UNIT', 164, y + 5.3, { align: 'right' })
  pdf.text('AMOUNT', CONTENT_RIGHT - 3, y + 5.3, { align: 'right' })
  y += 12

  if (!items.length) {
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    pdf.setTextColor(MUTED)
    pdf.text('No line items were returned for this order.', MARGIN, y)
    y += 8
  }

  items.forEach((item, index) => {
    const name = item.product_name ?? item.name ?? item.product?.name ?? 'Product'
    const variant = resolveOrderItemVariantLabel(item)
    const qty = Math.max(1, Number(item.quantity) || 1)
    const pricing = resolveOrderItemPricing(item)
    const nameLines = pdf.splitTextToSize(name, 112)
    const variantLines = variant ? pdf.splitTextToSize(variant, 112) : []
    const rowHeight = Math.max(8, nameLines.length * 4.2 + variantLines.length * 3.8 + 4)

    ensureSpace(rowHeight + 4)

    if (index % 2 === 0) {
      pdf.setFillColor(248, 250, 252)
      pdf.rect(MARGIN, y - 4, CONTENT_RIGHT - MARGIN, rowHeight, 'F')
    }

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(8.5)
    pdf.setTextColor(INK)
    pdf.text(nameLines, MARGIN + 3, y)
    let textY = y + nameLines.length * 4.2
    if (variantLines.length) {
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(7.5)
      pdf.setTextColor(MUTED)
      pdf.text(variantLines, MARGIN + 3, textY)
    }

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8.5)
    pdf.setTextColor(INK)
    const midY = y + 0.4
    pdf.text(String(qty), 138, midY, { align: 'right' })
    pdf.text(money(pricing.unitPrice), 164, midY, { align: 'right' })
    pdf.setFont('helvetica', 'bold')
    pdf.text(money(pricing.lineTotal), CONTENT_RIGHT - 3, midY, { align: 'right' })

    y += rowHeight
  })

  y += 4
  pdf.setDrawColor(RULE)
  pdf.line(MARGIN, y, CONTENT_RIGHT, y)
  y += 8

  const summary = [
    ['Subtotal', money(totals.subtotal)],
    totals.discountTotal > 0 ? ['Discount', `-${money(totals.discountTotal)}`] : null,
    ['Delivery', totals.deliveryFee <= 0 ? 'Free' : money(totals.deliveryFee)],
    totals.taxTotal > 0 ? ['Tax', money(totals.taxTotal)] : null,
  ].filter(Boolean)

  ensureSpace(summary.length * 6 + 18)
  summary.forEach(([label, value]) => {
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    pdf.setTextColor(MUTED)
    pdf.text(label, 128, y)
    pdf.setTextColor(label === 'Discount' ? BRAND : INK)
    pdf.text(value, CONTENT_RIGHT, y, { align: 'right' })
    y += 6
  })

  y += 2
  pdf.setFillColor(254, 242, 242)
  pdf.roundedRect(120, y - 5, CONTENT_RIGHT - 120, 12, 1.2, 1.2, 'F')
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(10)
  pdf.setTextColor(INK)
  pdf.text('Total paid', 128, y + 2.4)
  pdf.setTextColor(BRAND)
  pdf.text(money(totals.grandTotal), CONTENT_RIGHT - 3, y + 2.4, { align: 'right' })
  y += 18

  ensureSpace(16)
  pdf.setDrawColor(RULE)
  pdf.line(MARGIN, y, CONTENT_RIGHT, y)
  y += 8
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)
  pdf.setTextColor(MUTED)
  pdf.text('Thank you for shopping with EZ-Mall.', MARGIN, y)
  pdf.text('This invoice was generated from your order details.', MARGIN, y + 4.5)

  pdf.save(buildInvoiceFilename(orderNumber))
}
