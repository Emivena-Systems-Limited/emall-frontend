export function scrollAuthPanelToTop(behavior = 'smooth') {
  requestAnimationFrame(() => {
    const panel = document.querySelector('[data-auth-scroll-panel]')
    if (panel) {
      panel.scrollTo({ top: 0, behavior })
      return
    }
    window.scrollTo({ top: 0, behavior })
  })
}
