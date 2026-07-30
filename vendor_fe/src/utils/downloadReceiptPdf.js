import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import receiptSheetStyles from '../components/orders/orderReceiptSheet.css?inline'

function createIsolatedReceiptHost(element) {
  const host = document.createElement('div')
  host.setAttribute('data-receipt-pdf-host', 'true')
  host.style.cssText = 'position:fixed;left:-10000px;top:0;z-index:-1;background:#ffffff;'

  const style = document.createElement('style')
  style.textContent = receiptSheetStyles
  host.appendChild(style)

  const clone = element.cloneNode(true)
  host.appendChild(clone)
  document.body.appendChild(host)

  return { host, clone }
}

/**
 * Renders a DOM element into a single A4 PDF and triggers download.
 */
export async function downloadReceiptPdf(element, filename = 'order-receipt.pdf') {
  if (!element) {
    throw new Error('Receipt element not found.')
  }

  const { host, clone } = createIsolatedReceiptHost(element)

  try {
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    })

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 0

    const imgWidth = pageWidth - margin * 2
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    let renderWidth = imgWidth
    let renderHeight = imgHeight
    let offsetX = margin
    const offsetY = margin

    if (imgHeight > pageHeight - margin * 2) {
      renderHeight = pageHeight - margin * 2
      renderWidth = (canvas.width * renderHeight) / canvas.height
      offsetX = margin + (imgWidth - renderWidth) / 2
    }

    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', offsetX, offsetY, renderWidth, renderHeight)
    pdf.save(filename)
  } finally {
    host.remove()
  }
}

export function buildReceiptFilename(orderNumber) {
  const safe = String(orderNumber ?? 'order')
    .trim()
    .replace(/[^\w-]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `${safe || 'order'}-receipt.pdf`
}
