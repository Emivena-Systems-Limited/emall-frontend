function canScrollY(element) {
  if (!element) return false
  const style = window.getComputedStyle(element)
  const overflowY = style.overflowY
  if (overflowY !== 'auto' && overflowY !== 'scroll' && overflowY !== 'overlay') return false
  return element.scrollHeight > element.clientHeight + 1
}

export function findScrollParent(node) {
  let parent = node?.parentElement ?? null
  while (parent && parent !== document.body) {
    if (parent.dataset?.scrollRoot != null || canScrollY(parent)) return parent
    parent = parent.parentElement
  }
  return null
}

/**
 * When a nested scroller hits its top/bottom, forward remaining wheel delta
 * to the nearest parent scroll container so the user isn't stuck.
 */
export function attachScrollChain(element) {
  if (!element) return () => {}

  const onWheel = (event) => {
    if (event.ctrlKey || event.defaultPrevented) return

    const parent = findScrollParent(element)
    if (!parent) return

    const maxScroll = element.scrollHeight - element.clientHeight
    const deltaY = event.deltaY

    // Nested region isn't scrollable — always hand off to parent.
    if (maxScroll <= 1) {
      event.preventDefault()
      parent.scrollTop += deltaY
      return
    }

    const atTop = element.scrollTop <= 0
    const atBottom = element.scrollTop >= maxScroll - 1
    const scrollingDown = deltaY > 0
    const scrollingUp = deltaY < 0

    if ((scrollingDown && atBottom) || (scrollingUp && atTop)) {
      event.preventDefault()
      parent.scrollTop += deltaY
    }
  }

  element.addEventListener('wheel', onWheel, { passive: false })
  return () => element.removeEventListener('wheel', onWheel)
}
