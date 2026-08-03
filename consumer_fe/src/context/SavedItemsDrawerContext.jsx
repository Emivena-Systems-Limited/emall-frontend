import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const SavedItemsDrawerContext = createContext(null)

export function SavedItemsDrawerProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)

  const openSavedItemsDrawer = useCallback(() => setIsOpen(true), [])
  const closeSavedItemsDrawer = useCallback(() => setIsOpen(false), [])
  const toggleSavedItemsDrawer = useCallback(() => setIsOpen((open) => !open), [])

  const value = useMemo(
    () => ({ isOpen, openSavedItemsDrawer, closeSavedItemsDrawer, toggleSavedItemsDrawer }),
    [isOpen, openSavedItemsDrawer, closeSavedItemsDrawer, toggleSavedItemsDrawer],
  )

  return (
    <SavedItemsDrawerContext.Provider value={value}>
      {children}
    </SavedItemsDrawerContext.Provider>
  )
}

export function useSavedItemsDrawer() {
  const context = useContext(SavedItemsDrawerContext)
  if (!context) {
    throw new Error('useSavedItemsDrawer must be used within SavedItemsDrawerProvider')
  }
  return context
}

/** Safe for components that may render outside the provider (returns no-ops). */
export function useOptionalSavedItemsDrawer() {
  return useContext(SavedItemsDrawerContext)
}
