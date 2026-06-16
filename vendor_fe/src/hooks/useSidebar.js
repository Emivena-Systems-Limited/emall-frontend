import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'emall-vendor:sidebar-collapsed'

function readPreference() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function useSidebar() {
  const [collapsed, setCollapsed] = useState(readPreference)
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev
      try { localStorage.setItem(STORAGE_KEY, String(next)) } catch { /* noop */ }
      return next
    })
  }, [])

  const openMobile   = useCallback(() => setMobileOpen(true), [])
  const closeMobile  = useCallback(() => setMobileOpen(false), [])

  // Keyboard shortcut: Ctrl/Cmd + B
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        toggleCollapsed()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toggleCollapsed])

  // Close mobile drawer on resize past lg breakpoint
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const handler = (e) => { if (e.matches) closeMobile() }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [closeMobile])

  return { collapsed, toggleCollapsed, mobileOpen, openMobile, closeMobile }
}
