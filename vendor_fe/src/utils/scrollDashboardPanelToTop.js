export function scrollDashboardPanelToTop(behavior = 'smooth') {
  requestAnimationFrame(() => {
    const panel = document.querySelector('[data-dashboard-scroll-panel]')
    if (panel) {
      panel.scrollTo({ top: 0, behavior })
      return
    }
    window.scrollTo({ top: 0, behavior })
  })
}
