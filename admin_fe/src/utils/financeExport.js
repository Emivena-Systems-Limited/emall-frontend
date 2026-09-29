function csvCell(value) {
  const text = value == null ? '' : String(value)
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`
  return text
}

function downloadBlob(filename, mime, contents) {
  const blob = new Blob([contents], { type: mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function downloadCsv(filename, headers, rows) {
  const lines = [headers, ...rows].map((line) => line.map(csvCell).join(',')).join('\n')
  downloadBlob(filename, 'text/csv;charset=utf-8', lines)
}

export function downloadExcel(filename, headers, rows) {
  const cell = (value) => {
    const text = value == null ? '' : String(value)
    const type = typeof value === 'number' ? 'Number' : 'String'
    return `<Cell><Data ss:Type="${type}">${text.replaceAll('&', '&amp;').replaceAll('<', '&lt;')}</Data></Cell>`
  }
  const row = (values) => `<Row>${values.map(cell).join('')}</Row>`
  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Worksheet ss:Name="Report"><Table>
${row(headers)}
${rows.map(row).join('\n')}
</Table></Worksheet></Workbook>`
  downloadBlob(filename, 'application/vnd.ms-excel', xml)
}

export function printReport({ title, subtitle, headers, rows }) {
  const popup = window.open('', '_blank', 'noopener,noreferrer')
  if (!popup) return false
  const head = headers.map((header) => `<th>${header}</th>`).join('')
  const body = rows.map((line) => `<tr>${line.map((value) => `<td>${value ?? ''}</td>`).join('')}</tr>`).join('')
  popup.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
<style>
  body { font-family: sans-serif; color: #0f172a; padding: 32px; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  p { color: #64748b; font-size: 12px; margin: 0 0 20px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { text-align: left; border-bottom: 1px solid #e2e8f0; padding: 8px 6px; }
  th { font-size: 10px; letter-spacing: 0.04em; text-transform: uppercase; color: #64748b; }
</style></head><body>
<h1>${title}</h1><p>${subtitle}</p>
<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
</body></html>`)
  popup.document.close()
  popup.focus()
  popup.print()
  return true
}
