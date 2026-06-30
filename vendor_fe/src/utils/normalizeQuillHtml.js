function stripQuillUiNodes(root) {
  root.querySelectorAll('.ql-ui').forEach((node) => node.remove())
}

function normalizeQuillList(list, doc) {
  const items = [...list.children].filter((node) => node.tagName === 'LI')
  if (items.length === 0) return

  const isBulletList = items.every((li) => li.getAttribute('data-list') === 'bullet')

  if (isBulletList && list.tagName === 'OL') {
    const ul = doc.createElement('ul')
    items.forEach((li) => {
      li.removeAttribute('data-list')
      ul.appendChild(li)
    })
    list.replaceWith(ul)
    return
  }

  items.forEach((li) => li.removeAttribute('data-list'))
}

export function normalizeQuillDescriptionHtml(html = '') {
  if (!html || typeof html !== 'string') return ''

  if (typeof DOMParser === 'undefined') {
    return html.replace(/<span class="ql-ui"[^>]*>\s*<\/span>/gi, '')
  }

  const doc = new DOMParser().parseFromString(html, 'text/html')
  const { body } = doc

  stripQuillUiNodes(body)
  body.querySelectorAll('ol, ul').forEach((list) => normalizeQuillList(list, doc))

  return body.innerHTML
}
